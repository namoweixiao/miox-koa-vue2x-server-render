/**
 * Created by evio on 2017/3/17.
 */
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import AutoPrefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import source_modules from './source.modules';

const cwd = process.env.NODE_ENV === 'production' ? path.resolve(__dirname, '../../../../') : process.cwd();

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

export default function Client(options) {
    const PATH_BUILD_PREFIX = path.resolve(cwd, options.build);
    const PATH_ENTRY_FILE = path.resolve(cwd, options.entry.dir, options.entry.filename);
    const INCLUDE_REGEXP = source_modules(options);

    const config = {
        devtool: "#inline-source-map",
        entry: {
            'vendor': ['miox-router', 'vue', 'vuex', 'miox-vue2x-classify'],
            'app': [PATH_ENTRY_FILE]
        },
        output: {
            path: PATH_BUILD_PREFIX,
            publicPath: options.prefix
                ? `${options.prefix}/${options.build}`
                : '/' + options.build,
            filename: 'client.[name].[hash].js',
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
                'process.env.MIOX_ENV': '"client"'
            }),
            new webpack.optimize.CommonsChunkPlugin({ name: 'vendor' }),
            new HtmlWebpackPlugin({ template: `${options.entry.dir}/index.html` }),
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
        const pahter = options.prefix
            ? `${options.prefix}/__webpack_hmr`
            : '/__webpack_hmr';
        config.entry.app.unshift('webpack-hot-middleware/client?path=' + pahter);
    }

    return config;
}