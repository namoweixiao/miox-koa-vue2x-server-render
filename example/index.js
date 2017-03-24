/**
 * Created by evio on 2017/3/23.
 */
import './init';
import createServer from 'miox-simple';
import Store from './webstore/index';
import Routes from './routes';
import { Engine } from 'miox-vue2x';

export default createServer(app => {
    app.set('engine', Engine);
    app.set('vuex', Store);
    app.use(Routes.routes());
});