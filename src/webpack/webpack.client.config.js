/**
 * Created by evio on 2017/3/17.
 */
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function Client({ PATH_BUILD_PREFIX, PATH_ENTRY_FILE, options }) {
    const config = {
        devtool: "#inline-source-map",
        entry: {
            'vendor': options.vendors,
            'app': [PATH_ENTRY_FILE]
        },
        output: {
            path: PATH_BUILD_PREFIX,
            publicPath: options.prefix && (options.prefix !== '/')
                ? `${options.prefix}/${options.build}`
                : '/' + options.build,
            filename: 'client.[name].[hash].js',
        },
        module: {
            noParse: /es6-promise\.js$/,
            rules: []
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
        const pahter = options.prefix && (options.prefix !== '/')
            ? `${options.prefix}/__webpack_hmr`
            : '/__webpack_hmr';
        config.entry.app.unshift('webpack-hot-middleware/client?path=' + pahter);
    }

    return config;
}