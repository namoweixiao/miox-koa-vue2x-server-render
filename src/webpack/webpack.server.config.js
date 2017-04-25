/**
 * Created by evio on 2017/3/17.
 */
import webpack from 'webpack';
import unique from 'array-unique';
import VueSSRPlugin from 'vue-ssr-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function Server({ PATH_ENTRY_FILE, PATH_BUILD_PREFIX, options }) {
    return {
        target: 'node',
        devtool: "#inline-source-map",
        externals: options.externals,
        entry: PATH_ENTRY_FILE,
        output: {
            path: PATH_BUILD_PREFIX,
            publicPath: options.prefix && (options.prefix !== '/')
                ? `${options.prefix}/${options.build}`
                : '/' + options.build,
            filename: 'server-bundle.js',
            libraryTarget: 'commonjs2'
        },
        module: {
            noParse: /es6-promise\.js$/,
            rules: []
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