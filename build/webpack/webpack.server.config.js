'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = Server;

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _arrayUnique = require('array-unique');

var _arrayUnique2 = _interopRequireDefault(_arrayUnique);

var _vueSsrWebpackPlugin = require('vue-ssr-webpack-plugin');

var _vueSsrWebpackPlugin2 = _interopRequireDefault(_vueSsrWebpackPlugin);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by evio on 2017/3/17.
 */
function Server(_ref) {
    var PKG = _ref.PKG,
        PATH_ENTRY_FILE = _ref.PATH_ENTRY_FILE,
        PATH_BUILD_PREFIX = _ref.PATH_BUILD_PREFIX,
        options = _ref.options;

    var dependencies = (0, _keys2.default)(PKG.dependencies);
    var externals = options.vendors;
    var i = externals.length;
    while (i--) {
        var index = dependencies.indexOf(externals[i]);
        if (index > -1) {
            dependencies.splice(index, 1);
        }
    }

    return {
        target: 'node',
        devtool: "#inline-source-map",
        externals: dependencies,
        entry: PATH_ENTRY_FILE,
        output: {
            path: PATH_BUILD_PREFIX,
            publicPath: options.prefix && options.prefix !== '/' ? options.prefix + '/' + options.build : '/' + options.build,
            filename: 'server-bundle.js',
            libraryTarget: 'commonjs2'
        },
        module: {
            noParse: /es6-promise\.js$/,
            rules: []
        },
        plugins: [new _webpack2.default.DefinePlugin({
            'process.env.NODE_ENV': (0, _stringify2.default)(process.env.NODE_ENV || 'development'),
            'process.env.MIOX_ENV': '"server"'
        }), new _extractTextWebpackPlugin2.default('style.[hash].css'), new _vueSsrWebpackPlugin2.default()]
    };
}
module.exports = exports['default'];