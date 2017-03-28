'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _koaConnect = require('koa-connect');

var _koaConnect2 = _interopRequireDefault(_koaConnect);

var _memoryFs = require('memory-fs');

var _memoryFs2 = _interopRequireDefault(_memoryFs);

var _koaConvert = require('koa-convert');

var _koaConvert2 = _interopRequireDefault(_koaConvert);

var _koaStaticCache = require('koa-static-cache');

var _koaStaticCache2 = _interopRequireDefault(_koaStaticCache);

var _webpackClient = require('./webpack/webpack.client.config');

var _webpackClient2 = _interopRequireDefault(_webpackClient);

var _webpackServer = require('./webpack/webpack.server.config');

var _webpackServer2 = _interopRequireDefault(_webpackServer);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by evio on 2017/3/22.
 */
var MioxKoaVue2xServerRender = function (_EventEmitter) {
    (0, _inherits3.default)(MioxKoaVue2xServerRender, _EventEmitter);

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
    function MioxKoaVue2xServerRender(app) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        (0, _classCallCheck3.default)(this, MioxKoaVue2xServerRender);

        var _this = (0, _possibleConstructorReturn3.default)(this, (MioxKoaVue2xServerRender.__proto__ || (0, _getPrototypeOf2.default)(MioxKoaVue2xServerRender)).call(this));

        _this.renderer = null;
        _this.productionEnv = process.env.NODE_ENV === 'production';
        _this.app = app;
        _this.options = options;
        _this.clientConfig = (0, _webpackClient2.default)(_this.options);
        _this.serverConfig = (0, _webpackServer2.default)(_this.options);

        if (typeof _this.options.clientCallback === 'function') {
            _this.clientConfig = _this.options.clientCallback(_this.clientConfig);
        }

        if (typeof _this.options.serverCallback === 'function') {
            _this.serverConfig = _this.options.serverCallback(_this.serverConfig);
        }
        return _this;
    }

    (0, _createClass3.default)(MioxKoaVue2xServerRender, [{
        key: 'connect',
        value: function connect() {
            this.init();

            if (this.productionEnv) {
                this.RUN_IN_PRODUCTION();
            } else {
                this.RUN_IN_DEVELOPMENT();
            }

            this.beforeRendererCreated();
            this.CREATE_SERVER_PROCESS();
        }
    }, {
        key: 'beforeRendererCreated',
        value: function beforeRendererCreated() {
            var _this2 = this;

            this.app.use(function () {
                var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
                    return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    if (_this2.renderer) {
                                        _context.next = 4;
                                        break;
                                    }

                                    ctx.body = 'Wait for miox server render creating, hold on for a moment to refresh ....';
                                    _context.next = 6;
                                    break;

                                case 4:
                                    _context.next = 6;
                                    return next();

                                case 6:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, _this2);
                }));

                return function (_x2, _x3) {
                    return _ref.apply(this, arguments);
                };
            }());
        }
    }, {
        key: 'init',
        value: function init() {
            var _this3 = this;

            this.app.use(function () {
                var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    if (!_this3.productionEnv) {
                                        ctx.status = 200;
                                    }
                                    _context2.next = 3;
                                    return next();

                                case 3:
                                case 'end':
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, _this3);
                }));

                return function (_x4, _x5) {
                    return _ref2.apply(this, arguments);
                };
            }());
        }
    }, {
        key: 'createRenderer',
        value: function createRenderer(bundle, template) {
            template = template.replace('<!--vue-ssr-outlet-->', '<div class="mx-app"><div class="mx-webviews"><div class="mx-webview"><!--vue-ssr-outlet--></div></div></div>');

            return require('vue-server-renderer').createBundleRenderer(bundle, {
                template: template,
                cache: (0, _lruCache2.default)(this.options.lru || {
                    max: 1000,
                    maxAge: 1000 * 60 * 15
                })
            });
        }
    }, {
        key: 'response',
        value: function response(resolve) {
            var result = [];
            var stream = new _stream2.default.Writable({
                write: function write(chunk, encoding, callback) {
                    result.push(chunk);
                    callback();
                }
            });
            stream.on('finish', function () {
                return resolve(Buffer.concat(result));
            });
            return stream;
        }
    }, {
        key: 'onRenderError',
        value: function onRenderError(ctx, resolve) {
            var _this4 = this;

            return function (err) {
                if (!_this4.productionEnv) {
                    console.error('error during render : ' + ctx.request.url);
                    console.error(err);
                }

                resolve(err);
            };
        }
    }, {
        key: 'cast',
        value: function cast(ctx, body, code) {
            ctx.type = 'html';
            ctx.body = body;
            console.log('cast code:', code);
            ctx.status = code || 200;
        }
    }, {
        key: 'CREATE_SERVER_PROCESS',
        value: function CREATE_SERVER_PROCESS() {
            var _this5 = this;

            this.app.use(function () {
                var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx, next) {
                    var body;
                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
                                case 0:
                                    ctx.status = 404;

                                    _context3.next = 3;
                                    return new _promise2.default(function (resolve) {
                                        var object = { url: ctx.request.url, app: _this5.app, ctx: ctx };
                                        var res = _this5.response(resolve);
                                        _this5.renderer.renderToStream(object).on('error', _this5.onRenderError(ctx, resolve)).pipe(res);
                                    });

                                case 3:
                                    body = _context3.sent;

                                    if (!(body.code === 404)) {
                                        _context3.next = 8;
                                        break;
                                    }

                                    _context3.next = 7;
                                    return next();

                                case 7:
                                    return _context3.abrupt('return', _context3.sent);

                                case 8:

                                    if (body instanceof Error || typeof body.code === 'number') {
                                        _this5.cast(ctx, (body.code || 500) + ' | ' + body.message, body.code || 500);
                                    } else {
                                        _this5.cast(ctx, body);
                                    }

                                case 9:
                                case 'end':
                                    return _context3.stop();
                            }
                        }
                    }, _callee3, _this5);
                }));

                return function (_x6, _x7) {
                    return _ref3.apply(this, arguments);
                };
            }());
        }
    }, {
        key: 'RUN_IN_PRODUCTION',
        value: function RUN_IN_PRODUCTION() {
            var PATH_BUILD_PREFIX = _path2.default.resolve(process.cwd(), this.options.build);
            var PATH_SSR_BUNDLE = _path2.default.resolve(PATH_BUILD_PREFIX, this.options.bundle || 'vue-ssr-bundle.json');
            var PATH_SSR_TEMPLATE = _path2.default.resolve(PATH_BUILD_PREFIX, this.options.template || 'index.html');
            var bundle = require(PATH_SSR_BUNDLE);
            var template = _fs2.default.readFileSync(PATH_SSR_TEMPLATE, 'utf-8');
            this.renderer = this.createRenderer(bundle, template);
            this.RUN_IN_PRODUCTION_STATIC(PATH_BUILD_PREFIX);
        }
    }, {
        key: 'RUN_IN_PRODUCTION_STATIC',
        value: function RUN_IN_PRODUCTION_STATIC(PATH_BUILD_PREFIX) {
            var _ref4 = this.options.static || {},
                maxAge = _ref4.maxAge,
                gzip = _ref4.gzip,
                dynamic = _ref4.dynamic,
                args = (0, _objectWithoutProperties3.default)(_ref4, ['maxAge', 'gzip', 'dynamic']);

            this.emit('beforeProStatic');
            this.app.use((0, _koaConvert2.default)((0, _koaStaticCache2.default)(PATH_BUILD_PREFIX, (0, _extends3.default)({
                "prefix": this.options.prefix ? this.options.prefix + '/' + this.options.build : '/' + this.options.build,
                "maxAge": maxAge === undefined ? 31536000 : maxAge,
                "gzip": gzip ? true : !!gzip,
                "dynamic": dynamic === undefined ? true : !!dynamic
            }, args))));
            this.emit('afterProStatic');
        }
    }, {
        key: 'RUN_IN_DEVELOPMENT',
        value: function RUN_IN_DEVELOPMENT() {
            var _this6 = this;

            this.emit('beforeDevServer');
            this.SETUP_DEV_SERVER(function (bundle, template) {
                _this6.renderer = _this6.createRenderer(bundle, template);
            });
            this.emit('afterDevServer');
        }
    }, {
        key: 'SETUP_DEV_SERVER',
        value: function SETUP_DEV_SERVER(cb) {
            var _this7 = this;

            var bundle = void 0;
            var template = void 0;

            this.clientConfig.output.filename = '[name].js';
            this.clientConfig.plugins.push(new _webpack2.default.HotModuleReplacementPlugin(), new _webpack2.default.NoEmitOnErrorsPlugin());

            var clientCompiler = (0, _webpack2.default)(this.clientConfig);
            var devMiddleware = (0, _webpackDevMiddleware2.default)(clientCompiler, {
                publicPath: this.clientConfig.output.publicPath,
                stats: {
                    colors: true,
                    chunks: false
                }
            });

            this.app.use((0, _koaConnect2.default)(devMiddleware));

            clientCompiler.plugin('done', function () {
                var fs = devMiddleware.fileSystem;
                var filePath = _path2.default.join(_this7.clientConfig.output.path, _this7.options.template || 'index.html');
                if (fs.existsSync(filePath)) {
                    template = fs.readFileSync(filePath, 'utf-8');
                    if (bundle) {
                        cb(bundle, template);
                    }
                }
            });

            // hot middleware
            this.app.use((0, _koaConnect2.default)((0, _webpackHotMiddleware2.default)(clientCompiler, {
                path: this.options.prefix ? this.options.prefix + '/__webpack_hmr' : '/__webpack_hmr'
            })));

            // watch and update server renderer
            var serverCompiler = (0, _webpack2.default)(this.serverConfig);
            var mfs = new _memoryFs2.default();
            serverCompiler.outputFileSystem = mfs;
            serverCompiler.watch({}, function (err, stats) {
                if (err) throw err;
                stats = stats.toJson();
                stats.errors.forEach(function (err) {
                    return console.error(err);
                });
                stats.warnings.forEach(function (err) {
                    return console.warn(err);
                });

                // read bundle generated by vue-ssr-webpack-plugin
                var bundlePath = _path2.default.join(_this7.serverConfig.output.path, _this7.options.bundle || 'vue-ssr-bundle.json');
                bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'));
                if (template) {
                    cb(bundle, template);
                }
            });
        }
    }]);
    return MioxKoaVue2xServerRender;
}(_events.EventEmitter);

exports.default = MioxKoaVue2xServerRender;
module.exports = exports['default'];