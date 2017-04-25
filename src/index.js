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
import source_modules from './webpack/source.modules';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AutoPrefixer from 'autoprefixer';
import unique from 'array-unique';

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
     *  - cwd: <String>
     */
    constructor(app, options = {}) {
        super();
        this.renderer = null;
        this.productionEnv = process.env.NODE_ENV === 'production';
        this.app = app;
        this.options = options;

        if (!this.options.cwd) {
            this.options.cwd = process.cwd();
        }

        if (!this.options.vendors) {
            this.options.vendors = unique(['miox-router', 'vue', 'miox-vue2x-classify'].concat(this.options.vendors || []));
        }

        this.PKG = require(path.resolve(options.cwd, 'package.json'));
        this.PATH_ENTRY_FILE = path.resolve(options.cwd, options.entry.dir, options.entry.filename);
        this.PATH_BUILD_PREFIX = path.resolve(options.cwd, options.build);
        this.INCLUDE_REGEXP = source_modules(options);
        this.loaders = {};
        this.rules = {
            "vue": {
                test: /\.vue$/,
                loader: 'vue-loader',
                include: this.INCLUDE_REGEXP,
                options: {
                    preserveWhitespace: false,
                    postcss: [
                        AutoPrefixer({
                            browsers: ['last 20 versions']
                        })
                    ],
                    loaders: {}
                }
            },
            "js": {
                test: /\.js$/,
                use: { loader: 'babel-loader' },
                include: this.INCLUDE_REGEXP
            }
        }
    }

    loader(...args) {
        for (let i = 0 ; i < args.length; i++) {
            const arg = args[i];
            if (typeof arg === 'function') {
                arg.call(this);
            }
        }

        return this;
    }

    css() {
        const _loader = this.createLoader('css');
        this.loaders.css = {
            vue(options) {
                options.css = _loader;
            },
            common(options) {
                options.push({
                    test: /\.css$/,
                    loader: _loader
                })
            }
        };
    }

    less() {
        const _loader = this.createLoader('less');
        this.loaders.less = {
            vue(options) {
                options.less = _loader;
            },
            common(options) {
                options.push({
                    test: /\.less$/,
                    loader: _loader
                })
            }
        };
    }

    sass() {
        const _loader = this.createLoader('scss');
        this.loaders.sass = {
            vue(options) {
                options.scss = _loader;
            },
            common(options) {
                options.push({
                    test: /\.scss$/,
                    loader: _loader
                })
            }
        };
    }

    jsx() {
        const that = this;
        this.loaders.jsx = {
            vue(options) {
                options.jsx = {
                    use: { loader: 'babel-loader' },
                    include: that.INCLUDE_REGEXP
                }
            },
            common(options) {
                options.push({
                    test: /\.jsx$/,
                    use: { loader: 'babel-loader' },
                    include: that.INCLUDE_REGEXP
                });
            }
        }
    }

    createLoader(type) {
        const uses = [
            {
                loader: `css-loader`,
                options: { minimize: true }
            }
        ];

        switch (type) {
            case 'css':
                break;
            case 'scss':
                uses.push(`sass-loader`);
                break;
            default:
                uses.push(`${type}-loader`);
        }

        return ExtractTextPlugin.extract({ fallback: 'style-loader', use: uses });
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
        this.clientConfig = clientConfig({
            PATH_BUILD_PREFIX: this.PATH_BUILD_PREFIX,
            PATH_ENTRY_FILE: this.PATH_ENTRY_FILE,
            options: this.options
        });
        this.serverConfig = serverConfig({
            PKG: this.PKG,
            PATH_BUILD_PREFIX: this.PATH_BUILD_PREFIX,
            PATH_ENTRY_FILE: this.PATH_ENTRY_FILE,
            options: this.options
        });

        const loaders = this.loaders;
        for (const loader in loaders) {
            const { vue, common } = loaders[loader];
            vue(this.rules.vue.options.loaders);
            common(this.clientConfig.module.rules);
            common(this.serverConfig.module.rules);
        }

        for (const rule in this.rules) {
            this.clientConfig.module.rules.push(this.rules[rule]);
            this.serverConfig.module.rules.push(this.rules[rule]);
        }

        if (typeof this.options.clientCallback === 'function') {
            this.clientConfig = this.options.clientCallback(this.clientConfig);
        }

        if (typeof this.options.serverCallback === 'function') {
            this.serverConfig = this.options.serverCallback(this.serverConfig);
        }

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
            `<div class="mx-app"><div class="mx-webviews"><div class="mx-webview active"><!--vue-ssr-outlet--></div></div></div>`
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

            if (body instanceof Error || body.code) {
                console.log(new Date(), body);
                this.cast(ctx, `${body.code || 500} | ${body.message}`, typeof body.code === 'string' ? 500 : body.code);
            } else {
                this.cast(ctx, body);
            }
        });
    }

    RUN_IN_PRODUCTION() {
        const PATH_BUILD_PREFIX = path.resolve(this.options.cwd, this.options.build);
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
            "prefix": this.options.prefix && (this.options.prefix !== '/')
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