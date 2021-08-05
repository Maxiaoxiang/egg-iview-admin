import {
  getMenuByRouter,
} from '@/libs/util'
import * as types from './mutation-types';
import axios from 'axios';
import routers from '@/router/routers'
import {
  router
} from '../router/index';

export const getUser = function () {
  console.log('getUser方法');
};
export const getButtonResourceList = function (context) {
  try {
    return new Promise(function (resolve, reject) {
      let parameter = {
        sourceCode: context.state.app.buttonId,
        getSourceCode: 1
      };
      if(!parameter.sourceCode) return false;
      axios.get('/api/admin/jurisdiction', {
        params: parameter
      }).then(res => {
        resolve(res.data.data);
      }).catch(error => {
        reject(error);
      });
    });
  } catch (err) {
    console.log('获取界面元素失败');
  }
};
export const getMenuList = async function (context) {
  // console.log(context);
  const menuList = [...routers];
  const apiMenuList = await new Promise((resolve, reject) => {
    axios.get('/api/admin/jurisdiction/', {
      params: {
        page: 1,
        limit: 9999
      }
    }).then(res => {
      resolve(res.data.data);
    }).catch(error => {
      console.error('获取菜单失败：', error);
      reject(error);
    });
  });
  const formatMenuList = function (item, name) {
    if (!item.hasOwnProperty('children') || item.children.length === 0) {
      return false;
    }
    apiMenuList.forEach(apiItem => {
      if (name === apiItem.name) {
        item.meta.hideInMenu = false;
      }
    });
  };
  menuList.forEach(item => {
    formatMenuList(item, item.name);
  });
  // console.log(apiMenuList);
  console.log(menuList);
  context.state.app.menuList = getMenuByRouter(menuList);
  return menuList;
};
