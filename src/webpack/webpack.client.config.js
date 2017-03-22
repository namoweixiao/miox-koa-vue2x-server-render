/**
 * Created by evio on 2017/3/17.
 */
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import AutoPrefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import source_modules from './source.modules';

export default function Client(options) {
    const PATH_BUILD_PREFIX = path.resolve(process.cwd(), options.buildPrefix);
    const PATH_ENTRY_FILE = path.resolve(process.cwd(), options.entry.dir, options.entry.filename);
    const INCLUDE_REGEXP = source_modules(options);

    const config = {
        devtool: "#inline-source-map",
        entry: {
            'vendor': ['miox-router', 'vue', 'vuex', 'miox-vue2x-classify'],
            'app': [PATH_ENTRY_FILE]
        },
        output: {
            path: PATH_BUILD_PREFIX,
            publicPath: path.normalize(`/${path.normalize(options.buildPrefix).replace(/\/$/, '')}/`),
            filename: '[name].[hash].client.js',
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
                'process.env.MIOX_ENV': '"client"'
            }),
            new webpack.optimize.CommonsChunkPlugin({ name: 'vendor' }),
            new HtmlWebpackPlugin({ template: 'src/index.html' }),
            new ExtractTextPlugin('style.[hash].css')
        ]
    }

    if (process.env.NODE_ENV === 'production') {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }));
    } else {
        config.entry.app.unshift('webpack-hot-middleware/client');
    }

    return config;
}