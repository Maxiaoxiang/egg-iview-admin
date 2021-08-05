import Main from '@/components/main';

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
  {
    path: '/user',
    name: 'user_module',
    meta: {
      access: ['admin_element_7c20ad74c095611070c67507f125bf9a'],
      icon: 'logo-buffer',
      title: '用户管理'
    },
    component: Main,
    children: [
      {
        path: 'list',
        name: 'user_list',
        meta: {
          access: ['admin_element_7c20ad74c095611070c67507f125bf9a'],
          icon: 'md-people',
          title: '用户列表'
        },
        component: () => import('@/view/user/list.vue')
      }
    ]
  },
  {
    path: '/product',
    name: 'product_module',
    meta: {
      access: ['admin_element_d3cb92c98ea7fa21e8570413e957085f'],
      icon: 'logo-buffer',
      title: '商品管理'
    },
    component: Main,
    children: [
      {
        path: 'list',
        name: 'product_list',
        meta: {
          access: ['admin_element_c4873dde3190a85f28cb18e3f39699ec'],
          icon: 'md-laptop',
          title: '商品列表'
        },
        component: () => import('@/view/product/list.vue')
      }, {
        path: 'product_category',
        name: 'product_category',
        meta: {
          access: ['admin_element_03e2ed6c706b814db46fa70fa733321c'],
          icon: 'ios-keypad',
          title: '商品分类'
        },
        component: () => import('@/view/product/product-category.vue')
      }
    ]
  },
  {
    path: '/article',
    name: 'article_module',
    meta: {
      access: ['admin_element_c0cb18be03ac2cb6daecec58b6e87329'],
      icon: 'ios-paper',
      title: '文章管理'
    },
    component: Main,
    children: [
      {
        path: 'list',
        name: 'article_list',
        meta: {
          access: ['admin_element_8b80136546d7b6b9a37334caca03cf61'],
          icon: 'ios-list-box',
          title: '文章列表'
        },
        component: () => import('@/view/article/list.vue')
      }, {
        path: 'article_category',
        name: 'article_category',
        meta: {
          access: ['admin_element_aa38504125602b588150810fec519d73'],
          icon: 'ios-keypad',
          title: '文章分类'
        },
        component: () => import('@/view/article/article-category.vue')
      }
    ]
  },
  {
    path: '/banner',
    name: 'banner_module',
    meta: {
      access: ['admin_element_cdd2274943c8985b8e54ff1a9587867b'],
      icon: 'ios-paper',
      title: '轮播图管理'
    },
    component: Main,
    children: [
      {
        path: 'list',
        name: 'banner_list',
        meta: {
          access: ['admin_element_aa7348c198c8d4adf3932e87b19a02d6'],
          icon: 'ios-list-box',
          title: '轮播图列表'
        },
        component: () => import('@/view/banner/list.vue')
      }
    ]
  },
  {
    path: '/jurisdiction',
    name: 'jurisdiction_module',
    meta: {
      access: ['admin_element_85aa7c0226c5e7150684fd76c01c4380'],
      icon: 'ios-paper',
      title: '权限管理'
    },
    component: Main,
    children: [
      {
        path: 'role_list',
        name: 'role_list',
        meta: {
          access: ['admin_element_5271c8490d516f0b9b121c5151a56163'],
          icon: 'ios-list-box',
          title: '角色管理'
        },
        component: () => import('@/view/jurisdiction/role_list.vue')
      },{
        path: 'jurisdiction_list',
        name: 'jurisdiction_list',
        meta: {
          access: ['admin_element_e4b3302097be6238ff0ff157d9e551d5'],
          icon: 'ios-list-box',
          title: '资源管理'
        },
        component: () => import('@/view/jurisdiction/jurisdiction_list.vue')
      },
    ]
  },
  {
    path: '/task',
    name: 'task_module',
    meta: {
      access: ['admin_element_a36fe737b0ac60c90f53838701d49b1a'],
      icon: 'ios-paper',
      title: '任务管理'
    },
    component: Main,
    children: [
      {
        path: 'task_list',
        name: 'task_list',
        meta: {
          access: ['admin_element_9bc2023fce262a49b18a81a168a17e59'],
          icon: 'ios-list-box',
          title: '任务列表'
        },
        component: () => import('@/view/task/task_list.vue')
      }
    ]
  },
  {
    path: '/dict',
    name: 'dict_module',
    meta: {
      access: ['admin_element_d8f83b8e74cc48c44bb8008f92986fab'],
      icon: 'ios-paper',
      title: '字典管理'
    },
    component: Main,
    children: [
      {
        path: 'app_dict_list',
        name: 'app_dict_list',
        meta: {
          access: ['admin_element_dedd8834ae3f371d500495a4d8480cdd'],
          icon: 'ios-list-box',
          title: 'APP字典'
        },
        component: () => import('@/view/dict/app_dict_list.vue')
      },{
        path: 'zone_dict_list',
        name: 'zone_dict_list',
        meta: {
          access: ['admin_element_124ba47d9358f3afcc34e132aa11b1be'],
          icon: 'ios-list-box',
          title: '地区字典'
        },
        component: () => import('@/view/dict/zone_dict_list.vue')
      }
    ]
  },
  {
    path: '/org-manage',
    name: 'org-manage-module',
    meta: {
      access: ['admin_element_d8f83b8e74cc48c44bb8008f92986fab'],
      icon: 'ios-paper',
      title: '机构管理'
    },
    component: Main,
    children: [
      {
        path: 'sub-org-manage',
        name: 'sub-org-manage',
        meta: {
          access: ['admin_element_dedd8834ae3f371d500495a4d8480cdd'],
          icon: 'ios-list-box',
          title: '机构管理'
        },
        component: () => import('@/view/org-manage/sub-org-manage.vue')
      },{
        path: 'staff-manage',
        name: 'staff-manage',
        meta: {
          access: ['admin_element_124ba47d9358f3afcc34e132aa11b1be'],
          icon: 'ios-list-box',
          title: '员工管理'
        },
        component: () => import('@/view/org-manage/staff-manage.vue')
      }
    ]
  },
  {
    path: '/argu',
    name: 'argu',
    meta: {
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'params/:id',
        name: 'params',
        meta: {
          icon: 'md-flower',
          title: route => `{{ params }}-${route.params.id}`,
          notCache: true,
          beforeCloseName: 'before_close_normal'
        },
        component: () => import('@/view/argu-page/params.vue')
      },
      {
        path: 'query',
        name: 'query',
        meta: {
          icon: 'md-flower',
          title: route => `{{ query }}-${route.query.id}`,
          notCache: true
        },
        component: () => import('@/view/argu-page/query.vue')
      }
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
];
