<template>
  <div class="mod-list">
    <Row>
      <Col span="24">
        <Card dis-hover>
          <!-- 搜索栏 -->
          <Row type="flex" justify="start">
            <Form label-position="top" inline>
              <FormItem label="机构代码" prop="orgCode">
                <Input clearable v-model="searchCondition.orgCode" placeholder="机构代码"/>
              </FormItem>
              <FormItem label="应用名称" prop="appName">
                <Input clearable v-model="searchCondition.appName" placeholder="应用名称"/>
              </FormItem>
              <FormItem label="  ">
                <Button type="primary" @click="submitSearchForm" icon="ios-search" class="search-btn" :loading="searchCondition.loading">搜索</Button>
                <Button type="default" class="search-btn" @click="resetSearchForm">重置</Button>
              </FormItem>
            </Form>
          </Row>
          <div class="divider-line"></div>
          <!-- 按钮-->
          <Row class="btn-group">
            <Button type="primary" icon="md-add" @click="addModel()">添加</Button>
          </Row>
          <!-- 表格 -->
          <Row justify="center">
            <Col span="24">
              <Table :columns="columns" border :data="data" :loading="loading" :disabled-hover="true"/>
            </Col>
          </Row>
          <div class="page">
            <Page :total="total" :current="searchCondition.page" @on-change="changePage" show-total show-elevator/>
          </div>
          <!-- 新增弹窗 -->
          <Modal v-model="addModelStatus" title="添加基础字典" :mask-closable="false">
            <Row>
              <Col span="24">
                <Form ref="addProductForm" :label-width="80" :model="addFormData" :rules="addFormRules">
                  <FormItem label="机构代码" prop="orgCode">
                    <Input v-model="addFormData.orgCode" placeholder="请选择机构"/>
                  </FormItem>
                </Form>
              </Col>
            </Row>
            <Row slot="footer">
              <Col span="24">
                <Button type="default" @click="">取消</Button>
                <Button type="primary" @click="">确定</Button>
              </Col>
            </Row>
          </Modal>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>

  export default {
    data() {
      return {
        // 搜索条件
        searchCondition: {
          orgCode: '',
          appName: '',
          page: 1,
          limit: 10
        },
        addFormData: {
          orgCode: '', //机构代码
          appName: '', //应用名称
          appCode: '', //应用代码
        },
        addFormRules: {
          orgCode: [{
            required: true,
            message: '请选择机构',
            trigger: 'change'
          }]
        },
        addModelStatus: false, //弹窗
        total: 0,
        loading: false, // 商品列表加载loading
        // 数据
        data: [],
        // 商品表头
        columns: [{
          title: '序号',
          type: 'index',
          width: 80,
          align: 'center'
        }, {
          title: '机构代码',
          key: 'orgCode',
        }, {
          title: '应用名称',
          key: 'appName',
          tooltip: true,
        }, {
          title: '应用代码',
          key: 'appCode',
          width: 100
        },{
          title: '客户端',
          key: 'appCode',
          width: 100
        }, {
          title: '系统类型',
          key: 'create_time',
          width: 180
        }, {
          title: '操作',
          width: 180,
          render: (h, params) => {
            return h('div', [
              h('a', {
                on: {
                  click: () => {

                  }
                }
              }, '编辑'),
              h('Divider', {
                props: {
                  type: 'vertical'
                }
              }),
              h('a', [
                h('Poptip', {
                  props: {
                    confirm: true,
                    title: '确定要删除吗？',
                    type: 'error',
                    size: 'small',
                    transfer: true
                  },
                  on: {
                    'on-ok': () => {

                    }
                  }
                }, '删除')]
              )
            ])
          }
        }]
      }
    },
    computed: {

    },
    methods: {
      /**
       * 切换页码
       */
      changePage(num) {
        this.searchCondition.page = num;
        this.getListData();
      },
      /**
       * @description 切换日期
       */
      changeDate(datetime) {
        this.searchCondition.date = datetime;
      },
      /**
       * @description 获取列表数据
       */
      getListData() {
        let params = JSON.parse(JSON.stringify(this.searchCondition));
        this.loading = true;
        this.api.get('/api/admin/product', {
          params: {
            ...params
          }
        }).then(res => {
          this.loading = false;
          if (res.data.code) {
            this.$Message.error(res.data.msg);
          } else {
            let result = res.data.data;
            this.total = result.count;
          }
        })
      },
      /**
       * @description 提交条件搜索表单
       */
      async submitSearchForm() {
        this.searchCondition.page = 1;
        this.getProductListData();
      },
      /**
       * @description 重置条件搜索表单
       */
      resetSearchForm() {
        this.searchCondition = {
          orgCode: '',
          appName: '',
          page: 1,
          limit: 10
        };
        this.getListData();
      },
      //新增
      addModel() {
        this.addModelStatus = true;
      }
    },
    async created() {
      this.getListData();
    },
    mounted() {
    }
  }
</script>

<style>
</style>
