'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = Client;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _htmlWebpackPlugin = require('html-webpack-plugin');

var _htmlWebpackPlugin2 = _interopRequireDefault(_htmlWebpackPlugin);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _source = require('./source.modules');

var _source2 = _interopRequireDefault(_source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by evio on 2017/3/17.
 */
function Client(options) {
    var PATH_BUILD_PREFIX = _path2.default.resolve(process.cwd(), options.buildPrefix);
    var PATH_ENTRY_FILE = _path2.default.resolve(process.cwd(), options.entry.dir, options.entry.filename);
    var INCLUDE_REGEXP = (0, _source2.default)(options);

    var config = {
        devtool: "#inline-source-map",
        entry: {
            'vendor': ['miox-router', 'vue', 'vuex', 'miox-vue2x-classify'],
            'app': [PATH_ENTRY_FILE]
        },
        output: {
            path: PATH_BUILD_PREFIX,
            publicPath: _path2.default.normalize('/' + _path2.default.normalize(options.buildPrefix).replace(/\/$/, '') + '/'),
            filename: '[name].[hash].client.js'
        },
        module: {
            noParse: /es6-promise\.js$/,
            rules: [{
                test: /\.vue$/,
                loader: 'vue-loader',
                include: INCLUDE_REGEXP,
                options: {
                    preserveWhitespace: false,
                    postcss: [(0, _autoprefixer2.default)({ browsers: ['last 20 versions'] })],
                    loaders: {
                        css: _extractTextWebpackPlugin2.default.extract({ fallback: 'style-loader', use: 'css-loader' }),
                        less: _extractTextWebpackPlugin2.default.extract({ fallback: 'postcss-loader', use: 'less-loader' }),
                        scss: _extractTextWebpackPlugin2.default.extract({ fallback: 'postcss-loader', use: 'sass-loader' }),
                        sass: _extractTextWebpackPlugin2.default.extract({ fallback: 'postcss-loader', use: 'sass-loader' })
                    }
                }
            }, {
                test: /\.js$/,
                use: { loader: 'babel-loader' },
                include: INCLUDE_REGEXP
            }, {
                test: /\.jsx$/,
                use: { loader: 'babel-loader' },
                include: INCLUDE_REGEXP
            }, { test: /\.css$/, loader: _extractTextWebpackPlugin2.default.extract({ fallback: 'style-loader', use: 'css-loader' }) }, { test: /\.less$/, loader: _extractTextWebpackPlugin2.default.extract({ fallback: 'postcss-loader', use: 'less-loader' }) }, { test: /\.scss$/, loader: _extractTextWebpackPlugin2.default.extract({ fallback: 'postcss-loader', use: 'sass-loader' }) }]
        },
        plugins: [new _webpack2.default.DefinePlugin({
            'process.env.NODE_ENV': (0, _stringify2.default)(process.env.NODE_ENV || 'development'),
            'process.env.MIOX_ENV': '"client"'
        }), new _webpack2.default.optimize.CommonsChunkPlugin({ name: 'vendor' }), new _htmlWebpackPlugin2.default({ template: 'src/index.html' }), new _extractTextWebpackPlugin2.default('style.[hash].css')]
    };

    if (process.env.NODE_ENV === 'production') {
        config.plugins.push(new _webpack2.default.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }));
    } else {
        config.entry.app.unshift('webpack-hot-middleware/client');
    }

    return config;
}
module.exports = exports['default'];