/**
 * Created by evio on 2017/3/23.
 */
import Vuex from 'vuex';

export default new Vuex.Store({
    state: {
        me: '123rrrrrs'
    },
    mutations: {
        set_data(state, val) {
            state.me = val;
        }
    }
})