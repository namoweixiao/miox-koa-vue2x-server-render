/**
 * Created by evio on 2017/3/22.
 */
import path from 'path';
import fs from 'fs';
import Stream from 'stream';
import LruCache from 'lru-cache';
import webpack from 'webpack';
import ctk from 'koa-connect';
import MFS from 'memory-fs';
import Convert from 'koa-convert';
import staticCache from 'koa-static-cache';
import clientConfig from './webpack/webpack.client.config';
import serverConfig from './webpack/webpack.server.config';
import webpackDevMiddleWare from 'webpack-dev-middleware';
import hotMiddleWare from 'webpack-hot-middleware';
import { EventEmitter } from 'events';

export default class MioxKoaVue2xServerRender extends EventEmitter {
    /**
     * 配置
     * @param app
     * @param options
     *  - prefix: <Null|String> 前缀
     *  - entry: <Object> 源码地址，基于process.cwd()的目录，前缀不带任何符号。
     *      - dir: 目录地址
     *      - filename: 文件名
 *      - template: <String> 模板名
     *  - build: <String> 编译后文件地址，基于process.cwd()的目录，前缀不带任何符号。
     *  - lru: <Object> Lru-Cache 配置。
     *  - static: <Object> 静态资源配置`koa-static-cache`
     *  - clientCallback: <Function> 修改Client端配置
     *  - serverCallback: <Function> 修改Server端配置
     *  - externals: <Array> 排出掉的externals配置
     *  - bundle: <String> bundle名
     */
    constructor(app, options = {}) {
        super();
        this.renderer = null;
        this.productionEnv = process.env.NODE_ENV === 'production';
        this.app = app;
        this.options = options;
        this.clientConfig = clientConfig(this.options);
        this.serverConfig = serverConfig(this.options);

        if (typeof this.options.clientCallback === 'function') {
            this.clientConfig = this.options.clientCallback(this.clientConfig);
        }

        if (typeof this.options.serverCallback === 'function') {
            this.serverConfig = this.options.serverCallback(this.serverConfig);
        }
    }

    connect() {
        this.init();

        if (this.productionEnv) {
            this.RUN_IN_PRODUCTION();
        } else {
            this.RUN_IN_DEVELOPMENT();
        }

        this.beforeRendererCreated();
        this.CREATE_SERVER_PROCESS();
    }

    beforeRendererCreated() {
        this.app.use(async (ctx, next) => {
            if (!this.renderer) {
                ctx.body = 'Wait for miox server render creating, hold on for a moment to refresh ....';
            } else {
                await next();
            }
        });
    }

    init() {
        this.app.use(async (ctx, next) => {
            if (!this.productionEnv){
                ctx.status = 200;
            }
            await next();
        });
    }

    createRenderer (bundle, template) {
        template = template.replace(
            '<!--vue-ssr-outlet-->',
            `<div class="mx-app"><div class="mx-webviews"><div class="mx-webview"><!--vue-ssr-outlet--></div></div></div>`
        );

        return require('vue-server-renderer').createBundleRenderer(bundle, {
            template,
            cache: LruCache(this.options.lru || {
                max: 1000,
                maxAge: 1000 * 60 * 15
            })
        })
    }

    response(resolve) {
        let result = [];
        const stream = new Stream.Writable({
            write(chunk, encoding, callback) {
                result.push(chunk);
                callback();
            }
        });
        stream.on('finish', () => resolve(Buffer.concat(result)));
        return stream;
    }

    onRenderError(ctx, resolve) {
        return err => {
            if (!this.productionEnv) {
                console.error(`error during render : ${ctx.request.url}`)
                console.error(err)
            }

            resolve(err);
        }
    }

    cast(ctx, body, code) {
        ctx.type = 'html';
        ctx.body = body;
        console.log('cast code:', code)
        ctx.status = code || 200;
    }

    CREATE_SERVER_PROCESS() {
        this.app.use(async (ctx, next) => {
            ctx.status = 404;

            const body = await new Promise(resolve => {
                const object = { url: ctx.request.url, app: this.app, ctx };
                const res = this.response(resolve);
                this.renderer.renderToStream(object).on('error', this.onRenderError(ctx, resolve)).pipe(res);
            });

            if (body.code ===404) {
                return await next();
            }

            if (body instanceof Error || typeof body.code === 'number') {
                this.cast(ctx, `${body.code || 500} | ${body.message}`, body.code || 500);
            } else {
                this.cast(ctx, body);
            }
        });
    }

    RUN_IN_PRODUCTION() {
        const PATH_BUILD_PREFIX = path.resolve(process.cwd(), this.options.build);
        const PATH_SSR_BUNDLE = path.resolve(PATH_BUILD_PREFIX, this.options.bundle || 'vue-ssr-bundle.json');
        const PATH_SSR_TEMPLATE = path.resolve(PATH_BUILD_PREFIX, this.options.template || 'index.html');
        const bundle = require(PATH_SSR_BUNDLE);
        const template = fs.readFileSync(PATH_SSR_TEMPLATE, 'utf-8');
        this.renderer = this.createRenderer(bundle, template);
        this.RUN_IN_PRODUCTION_STATIC(PATH_BUILD_PREFIX);
    }

    RUN_IN_PRODUCTION_STATIC(PATH_BUILD_PREFIX) {
        const { maxAge, gzip, dynamic, ...args } = this.options.static || {};
        this.emit('beforeProStatic');
        this.app.use(Convert(staticCache(PATH_BUILD_PREFIX, {
            "prefix": this.options.prefix
                ? `${this.options.prefix}/${this.options.build}`
                : '/' + this.options.build,
            "maxAge": maxAge === undefined ? 31536000 : maxAge,
            "gzip": gzip ? true : !!gzip,
            "dynamic": dynamic === undefined ? true : !!dynamic,
            ...args
        })));
        this.emit('afterProStatic');
    }

    RUN_IN_DEVELOPMENT() {
        this.emit('beforeDevServer');
        this.SETUP_DEV_SERVER((bundle, template) => {
            this.renderer = this.createRenderer(bundle, template);
        });
        this.emit('afterDevServer');
    }

    SETUP_DEV_SERVER(cb) {
        let bundle;
        let template;

        this.clientConfig.output.filename = '[name].js';
        this.clientConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        );

        const clientCompiler = webpack(this.clientConfig);
        const devMiddleware = webpackDevMiddleWare(clientCompiler, {
            publicPath: this.clientConfig.output.publicPath,
            stats: {
                colors: true,
                chunks: false
            }
        });

        this.app.use(ctk(devMiddleware));

        clientCompiler.plugin('done', () => {
            const fs = devMiddleware.fileSystem;
            const filePath = path.join(this.clientConfig.output.path, this.options.template || 'index.html');
            if (fs.existsSync(filePath)) {
                template = fs.readFileSync(filePath, 'utf-8');
                if (bundle) {
                    cb(bundle, template);
                }
            }
        });

        // hot middleware
        this.app.use(ctk(hotMiddleWare(clientCompiler, {
            path: this.options.prefix
                ? `${this.options.prefix}/__webpack_hmr`
                : '/__webpack_hmr'
        })));


        // watch and update server renderer
        const serverCompiler = webpack(this.serverConfig);
        const mfs = new MFS();
        serverCompiler.outputFileSystem = mfs;
        serverCompiler.watch({}, (err, stats) => {
            if (err) throw err
            stats = stats.toJson()
            stats.errors.forEach(err => console.error(err))
            stats.warnings.forEach(err => console.warn(err))

            // read bundle generated by vue-ssr-webpack-plugin
            const bundlePath = path.join(this.serverConfig.output.path, this.options.bundle || 'vue-ssr-bundle.json');
            bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'));
            if (template) {
                cb(bundle, template);
            }
        });
    }

}