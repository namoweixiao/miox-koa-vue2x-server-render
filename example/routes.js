/**
 * Created by evio on 2017/3/23.
 */
import Router from 'miox-router';
import store from './webstore/index';
import Home from './webviews/index/index.vue';

const route = new Router();
export default route;

route.patch('/', async ctx => {
    store.commit('set_data', new Date().getTime());
    await ctx.render(Home);
});