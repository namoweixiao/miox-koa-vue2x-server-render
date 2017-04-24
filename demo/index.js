/**
 * Created by evio on 2017/3/24.
 */
import Koa from 'koa';
import Router from 'koa-router';
import ServerRender from '../src/index';
import config from './config';

const app = new Koa();
const indexRoute = new Router();
const pageRoute = new Router();
const server = new ServerRender(pageRoute, config);
server.loader(server.jsx, server.css, server.less, server.sass);
server.connect();
pageRoute.get('/(.+)?', async (ctx, next) => await next());

indexRoute.use('/web', pageRoute.routes(), pageRoute.allowedMethods());
app.use(indexRoute.routes(), indexRoute.allowedMethods());
app.listen(3000, () => console.log('start server at http://127.0.0.1:3000'));