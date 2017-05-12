/**
 * Created by evio on 2017/5/11.
 */
const merge = require('webpack-merge');

var path = require('path');
var baseConfig = {
    server: {
        target: 'node',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'lib.node.js'
        }
    },
    client: {
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'lib.js'
        }
    }
};

// specialized configuration
var production = {
    client: {
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[hash].js',
            c: 1
        }
    }
}

console.log(merge.multiple(baseConfig, production));