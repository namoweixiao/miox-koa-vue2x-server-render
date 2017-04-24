'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = Client;

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _htmlWebpackPlugin = require('html-webpack-plugin');

var _htmlWebpackPlugin2 = _interopRequireDefault(_htmlWebpackPlugin);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Client(_ref) {
    var PATH_BUILD_PREFIX = _ref.PATH_BUILD_PREFIX,
        PATH_ENTRY_FILE = _ref.PATH_ENTRY_FILE,
        options = _ref.options;

    var config = {
        devtool: "#inline-source-map",
        entry: {
            'vendor': options.vendors,
            'app': [PATH_ENTRY_FILE]
        },
        output: {
            path: PATH_BUILD_PREFIX,
            publicPath: options.prefix && options.prefix !== '/' ? options.prefix + '/' + options.build : '/' + options.build,
            filename: 'client.[name].[hash].js'
        },
        module: {
            noParse: /es6-promise\.js$/,
            rules: []
        },
        plugins: [new _webpack2.default.DefinePlugin({
            'process.env.NODE_ENV': (0, _stringify2.default)(process.env.NODE_ENV || 'development'),
            'process.env.MIOX_ENV': '"client"'
        }), new _webpack2.default.optimize.CommonsChunkPlugin({ name: 'vendor' }), new _htmlWebpackPlugin2.default({ template: options.entry.dir + '/index.html' }), new _extractTextWebpackPlugin2.default('style.[hash].css')]
    };

    if (process.env.NODE_ENV === 'production') {
        config.plugins.push(new _webpack2.default.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }));
    } else {
        var pahter = options.prefix ? options.prefix + '/__webpack_hmr' : '/__webpack_hmr';
        config.entry.app.unshift('webpack-hot-middleware/client?path=' + pahter);
    }

    return config;
} /**
   * Created by evio on 2017/3/17.
   */
module.exports = exports['default'];