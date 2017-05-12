/**
 * Created by evio on 2017/3/24.
 */
const path = require('path');
module.exports = {
    app: path.resolve(__dirname, '../example/index.js'),
    build: path.resolve(__dirname, '../dist'),
    prefix: '/',
    hot: true,
    whitelist: [/\/example/]
};