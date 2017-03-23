/**
 * Created by evio on 2017/3/17.
 */
import path from 'path';
import webpack from 'webpack';
import unique from 'array-unique';
import source_modules from './source.modules';
import AutoPrefixer from 'autoprefixer';
import VueSSRPlugin from 'vue-ssr-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

function createLoader(type) {
    const uses = [{ loader: `css-loader`, options: { minimize: true }}];

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

module.exports = options => {
    const PKG = require(path.resolve(process.cwd(), 'package.json'));
    const PATH_ENTRY_FILE = path.resolve(process.cwd(), options.entry.dir, options.entry.filename);
    const PATH_BUILD_PREFIX = path.resolve(process.cwd(), options.buildPrefix);
    const INCLUDE_REGEXP = source_modules(options);
    const dependencies = Object.keys(PKG.dependencies);
    let externals = options.externals || [];
    externals.push('normalize.css', 'miox-simple', 'miox-core');
    externals = unique(externals);
    let i = externals.length;
    while (i--) {
        const index = dependencies.indexOf(externals[i]);
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
            publicPath: path.normalize(`/${path.normalize(options.buildPrefix).replace(/\/$/, '')}/`),
            filename: 'server-bundle.js',
            libraryTarget: 'commonjs2'
        },
        module: {
            noParse: /es6-promise\.js$/,
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    include: INCLUDE_REGEXP,
                    options: {
                        preserveWhitespace: false,
                        postcss: [ AutoPrefixer({browsers: ['last 20 versions']}) ],
                        loaders: { css: createLoader('css'),  less: createLoader('less'),  scss: createLoader('scss') }
                    }
                },
                {
                    test: /\.js$/,
                    use: { loader: 'babel-loader', },
                    include: INCLUDE_REGEXP
                },
                {
                    test: /\.jsx$/,
                    use: { loader: 'babel-loader', },
                    include: INCLUDE_REGEXP
                },
                {
                    test: /\.css$/,
                    loader: createLoader('css')
                },
                {
                    test: /\.less$/,
                    loader: createLoader('less')
                },
                {
                    test: /\.scss$/,
                    loader: createLoader('scss')
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
                'process.env.MIOX_ENV': '"server"'
            }),
            new ExtractTextPlugin('style.[hash].css'),
            new VueSSRPlugin()
        ]
    }
}