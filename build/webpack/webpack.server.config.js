'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _arrayUnique = require('array-unique');

var _arrayUnique2 = _interopRequireDefault(_arrayUnique);

var _source = require('./source.modules');

var _source2 = _interopRequireDefault(_source);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _vueSsrWebpackPlugin = require('vue-ssr-webpack-plugin');

var _vueSsrWebpackPlugin2 = _interopRequireDefault(_vueSsrWebpackPlugin);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createLoader(type) {
    var uses = [{ loader: 'css-loader', options: { minimize: true } }];

    switch (type) {
        case 'css':
            break;
        case 'scss':
            uses.push('sass-loader');
            break;
        default:
            uses.push(type + '-loader');
    }

    return _extractTextWebpackPlugin2.default.extract({ fallback: 'style-loader', use: uses });
} /**
   * Created by evio on 2017/3/17.
   */


module.exports = function (options) {
    var PKG = require(_path2.default.resolve(process.cwd(), 'package.json'));
    var PATH_ENTRY_FILE = _path2.default.resolve(process.cwd(), options.entry.dir, options.entry.filename);
    var PATH_BUILD_PREFIX = _path2.default.resolve(process.cwd(), options.build);
    var INCLUDE_REGEXP = (0, _source2.default)(options);
    var dependencies = (0, _keys2.default)(PKG.dependencies);
    var externals = options.externals || [];
    externals.push('normalize.css', 'miox-simple', 'miox-core', 'miox-router', 'vuex', 'vue', 'miox-vue2x');
    externals = (0, _arrayUnique2.default)(externals);
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
            publicPath: options.prefix ? options.prefix + '/' + options.build : '/' + options.build,
            filename: 'server-bundle.js',
            libraryTarget: 'commonjs2'
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
                    loaders: { css: createLoader('css'), less: createLoader('less'), scss: createLoader('scss') }
                }
            }, {
                test: /\.js$/,
                use: { loader: 'babel-loader' },
                include: INCLUDE_REGEXP
            }, {
                test: /\.jsx$/,
                use: { loader: 'babel-loader' },
                include: INCLUDE_REGEXP
            }, {
                test: /\.css$/,
                loader: createLoader('css')
            }, {
                test: /\.less$/,
                loader: createLoader('less')
            }, {
                test: /\.scss$/,
                loader: createLoader('scss')
            }]
        },
        plugins: [new _webpack2.default.DefinePlugin({
            'process.env.NODE_ENV': (0, _stringify2.default)(process.env.NODE_ENV || 'development'),
            'process.env.MIOX_ENV': '"server"'
        }), new _extractTextWebpackPlugin2.default('style.[hash].css'), new _vueSsrWebpackPlugin2.default()]
    };
};