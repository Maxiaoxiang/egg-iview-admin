import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import state from './state';
import mutations from './mutations';
import app from './module/app';
import user from './module/user';

Vue.use(Vuex);

const store = new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  modules: {
    app,
    user
  }
});

export default store;
