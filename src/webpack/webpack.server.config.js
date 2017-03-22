/**
 * Created by evio on 2017/3/17.
 */
import path from 'path';
import webpack from 'webpack';
import source_modules from './source.modules';
import AutoPrefixer from 'autoprefixer';
import VueSSRPlugin from 'vue-ssr-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

module.exports = options => {
    const PKG = require(path.resolve(process.cwd(), 'package.json'));
    const PATH_ENTRY_FILE = path.resolve(process.cwd(), options.entry.dir, options.entry.filename);
    const PATH_BUILD_PREFIX = path.resolve(process.cwd(), options.buildPrefix);
    const INCLUDE_REGEXP = source_modules(options);

    return {
        target: 'node',
        devtool: "#inline-source-map",
        externals: Object.keys(PKG.dependencies),
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
                        postcss: [
                            AutoPrefixer({browsers: ['last 20 versions']})
                        ],
                        loaders: {
                            css: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }),
                            less: ExtractTextPlugin.extract({ fallback: 'postcss-loader', use: 'less-loader' }),
                            scss: ExtractTextPlugin.extract({ fallback: 'postcss-loader', use: 'sass-loader' }),
                            sass: ExtractTextPlugin.extract({ fallback: 'postcss-loader', use: 'sass-loader' })
                        }
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
                { test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) },
                { test: /\.less$/, loader: ExtractTextPlugin.extract({ fallback: 'postcss-loader', use: 'less-loader' }) },
                { test: /\.scss$/, loader: ExtractTextPlugin.extract({ fallback: 'postcss-loader', use: 'sass-loader' }) }
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