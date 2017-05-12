/**
 * Created by evio on 2017/5/11.
 */
const server = require('./a');
const base = require('./ssr');
server.use(base);
module.exports = server;