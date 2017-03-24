/**
 * Created by evio on 2017/3/23.
 */
const config = require('./config');
const ServerRenderer = require('../build/index');
const app = new ServerRenderer(null, config);
module.exports = app.clientConfig;