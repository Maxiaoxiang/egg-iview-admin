<template>
  <div class="mod-list">
    <Row>
      <Col span="24">
        <Card dis-hover>
          <!-- 搜索栏 -->
          <Row type="flex" justify="start">
            <Form label-position="top" inline>
              <FormItem label="文章标题" prop="title">
                <Input clearable v-model="searchCondition.title" placeholder="文章标题"></Input>
              </FormItem>
              <FormItem label="创建时间" prop="date">
                <DatePicker type="daterange" @on-change="(datetime)=>{changeDate(datetime)}" placeholder="创建时间" ref="date"></DatePicker>
              </FormItem>
              <FormItem label="状态" prop="publish_status">
                <Select v-model="searchCondition.publish_status">
                  <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
              <FormItem label="  ">
                <Button type="primary" @click="submitSearchForm" icon="ios-search" class="search-btn" :loading="searchCondition.loading">搜索
                </Button>
                <Button type="default" class="search-btn" @click="resetSearchForm">重置</Button>
              </FormItem>
            </Form>
          </Row>
          <div class="divider-line"></div>
          <!-- 按钮-->
          <Row class="btn-group">
            <Button type="primary" icon="md-add" @click="toggleAddModel('')">新增文章</Button>
          </Row>
          <!-- 表格 -->
          <Row justify="center">
            <Table :columns="columns" border :data="data" :loading="loading" :disabled-hover="true"></Table>
          </Row>
          <div class="page">
            <Page :total="total" :current="searchCondition.page" @on-change="changePage" show-total show-elevator></Page>
          </div>
          <!-- 新增弹窗 -->
          <Modal v-model="addModel" title="编辑文章" :mask-closable="false" :label-width="80" width="800">
            <Row>
              <Form ref="addForm" :label-width="80" :model="addFormData" :rules="addFormRules">
                <FormItem label="标题" prop="title">
                  <Input v-model="addFormData.title" placeholder="请输入文章标题"/>
                </FormItem>
                <FormItem label="描述">
                  <Input v-model="addFormData.description" placeholder="请输入文章描述"/>
                </FormItem>
                <FormItem label="内容">
                  <editor ref="editor" :value="addFormData.content" @on-change="handleChange"/>
                </FormItem>
                <FormItem label="状态">
                  <RadioGroup v-model="addFormData.publish_status" true-value="1" false-value="0">
                    <Radio label="1">启用</Radio>
                    <Radio label="0">禁用</Radio>
                  </RadioGroup>
                </FormItem>
                <FormItem label="分类">
                  <Cascader :data="categoryList" v-model="addFormData.category_id" trigger="hover"></Cascader>
                </FormItem>
              </Form>
            </Row>
            <Row slot="footer">
              <Button type="default" v-show="!addModelLoading" @click="toggleAddModel">取消</Button>
              <Button type="primary" :loading="addModelLoading" @click="submitAddForm">确定</Button>
            </Row>
          </Modal>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
  import Editor from '_c/editor'

  export default {
    components: {
      Editor
    },
    data() {
      return {
        // 搜索条件
        searchCondition: {
          title: '', //文章标题
          date: '', //创建时间
          publish_status: '', //状态
          page: 1,
          limit: 10
        },
        total: 0,
        statusList: [{ //状态
          label: '全部',
          value: ''
        }, {
          label: '启用',
          value: '1'
        }, {
          label: '禁用',
          value: '0'
        }],
        handleType: '', //编辑状态，''新增，'edit'编辑
        addModel: false, // 新增弹窗状态
        addFormData: {
          title: '', // 文章标题
          description: '', // 描述
          content: '', //内容
          publish_status: '1', // 上架状态
          category_id: [], // 分类
        },
        addModelLoading: false, // 新增商品弹窗按钮状态
        addFormRules: { // 校验规则
          title: [{
            required: true,
            message: '请输入文章标题',
            trigger: 'blur'
          }]
        },
        categoryList: [], // 分类
        loading: false, // 列表加载loading
        data: [], //列表数据
        columns: [{
          title: 'ID',
          key: 'id',
          sortable: true,
          width: 80,
          align: 'center'
        }, {
          title: '标题',
          key: 'title',
        }, {
          title: '描述',
          key: 'description',
          tooltip: true,
        }, {
          title: '分类',
          key: 'category_name',
          width: 100
        },
        //   {
        //   title: '缩略图',
        //   key: 'thumb',
        //   width: 100,
        //   align: 'center',
        //   render: (h, params) => {
        //     return params.row['thumb'] ? h('img', {
        //       attrs: {
        //         src: this.$config.baseUrl.pic + params.row['thumb'],
        //         style: 'width: 40px;vertical-align: middle;object-fit: contain;'
        //       }
        //     }) : null
        //   }
        // },
          {
          title: '创建时间',
          key: 'create_time',
          width: 180
        }, {
          title: '状态',
          key: 'publish_status',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('i-switch', {
                props: {
                  type: 'primary',
                  size: 'large',
                  value: params.row.publish_status === 1 // 控制开关的打开或关闭状态
                },
                scopedSlots: {
                  open: () => h('span', '启用'),
                  close: () => h('span', '禁用')
                },
                on: {
                  'on-change': value => {
                    // 启用/禁用
                    this.api.put(`/api/admin/article/${params.row.id}/`, {publish_status: ~~value}).then(res => {
                      if (res.data.code) {
                        this.$Message.error(res.data.msg);
                      }
                    });
                  }
                }
              })
            ])
          }
        }, {
          title: '操作',
          width: 180,
          render: (h, params) => {
            return h('div', [
              h('a', {
                on: {
                  click: () => {
                    let data = Object.assign({}, params.row, {
                      publish_status: params.row['publish_status'].toString(),
                      category_id: params.row['category_list']
                    });
                    this.toggleAddModel(data);
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
                      this.api.delete(`/api/admin/article/${params.row.id}/`).then(res => {
                        if (res.data.code) {
                          this.$Message.error(res.data.msg);
                        } else {
                          this.$Message.success(res.data.msg);
                          this.getListData();
                        }
                      })
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
      qiniuToken () {
        return this.$store.state.user.qiniuToken;
      }
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
       * @description 富文本编辑器编辑
       */
      handleChange(html) {
        this.addFormData.content = html;
      },
      /**
       * @description 获取列表数据
       */
      getListData() {
        let params = JSON.parse(JSON.stringify(this.searchCondition));
        delete params.date;
        if (this.searchCondition.date.length > 1 && this.searchCondition.date[0]) {
          params.startDate = this.searchCondition.date[0];
          params.endDate = this.searchCondition.date[1];
        }
        this.loading = true;
        this.api.get('/api/admin/article/', {
          params: {
            ...params
          }
        }).then(res => {
          if (res.data.code) {
            this.$Message.error(res.data.msg);
          } else {
            let result = res.data.data;
            let categoryArr = []; //临时存储分类id列表

            /**
             * @description 递归查找对应分类的分类Id列表
             * @param node {Object} 当前节点对象
             * @param id {Number} 查找的id
             */
            function findNodeCategory(node, id) {
              if (node.hasOwnProperty('children') && node['children'].length > 0) {
                node['children'].forEach(item => {
                  if (item['value'] === id) {
                    categoryArr = node['category'];
                  } else {
                    findNodeCategory(item, id);
                  }
                });
              }
            }

            //整理分类数据结构
            result.data.forEach(item => {
              categoryArr = [];
              this.categoryList.forEach(category => {
                findNodeCategory(category, item['category_id']);
              });
              item['category_list'] = [...categoryArr, item['category_id']];
            });
            this.data = result.data;
            this.total = result.count;
            this.loading = false;
          }
        })
      },
      /**
       * @description 获取分类列表
       */
      getCategoryList() {
        return new Promise(resolve => {
          this.api.get('/api/admin/article_category/', {
            params: {
              limit: 999
            }
          }).then(res => {
            if (res.data.code) {
              this.$Message.error(res.data.msg);
            } else {
              this.categoryList = res.data.data;
              resolve();
            }
          });
        });
      },
      /**
       * @description 新增
       */
      toggleAddModel(data) {
        this.handleType = data ? 'edit' : '';
        this.addFormData = data ? Object.assign({}, this.addFormData, data) : {
          title: '', // 文章标题
          description: '', // 描述
          content: '', //内容
          publish_status: '1', // 上架状态
          category_id: [], // 分类
        };
        this.$refs.editor.setHtml(this.addFormData.content);
        this.$refs.addForm.resetFields(); //重置表单
        this.addModel = !this.addModel;
      },
      /**
       * @description 提交新增表单
       */
      submitAddForm() {
        this.$refs.addForm.validate(valid => {
          if (valid) {
            if (this.handleType) {
              this.api.put('/api/admin/article/' + this.addFormData.id + '/', {
                title: this.addFormData.title,
                description: this.addFormData.description,
                content: this.addFormData.content,
                publish_status: this.addFormData.publish_status,
                category_id: this.addFormData.category_id[this.addFormData.category_id.length - 1],
              }).then((res) => {
                if (!res.data.code) {
                  this.$Message.success(res.data.msg);
                  this.addModel = false;
                  this.getListData();
                } else {
                  this.$Message.error(res.data.msg);
                }
              });
            } else {
              this.api.post('/api/admin/article/', {
                title: this.addFormData.title,
                description: this.addFormData.description,
                content: this.addFormData.content,
                publish_status: this.addFormData.publish_status,
                category_id: this.addFormData.category_id[this.addFormData.category_id.length - 1],
              }).then((res) => {
                if (!res.data.code) {
                  this.$Message.success(res.data.msg);
                  this.addModel = false;
                  this.getListData();
                } else {
                  this.$Message.error(res.data.msg);
                }
              });
            }
          }
        })
      },
      /**
       * @description 提交条件搜索表单
       */
      async submitSearchForm() {
        this.searchCondition.page = 1;
        this.getListData();
      },
      /**
       * @description 重置条件搜索表单
       */
      resetSearchForm() {
        this.searchCondition = {
          title: '',
          date: '',
          publish_status: '',
          page: 1,
          limit: 10
        };
        this.$refs.date.handleClear(); //清空日期
        this.getListData();
      },
    },
    async created() {
      await this.getCategoryList();
      this.getListData()
    },
    mounted() {
    }
  }
</script>

<style>
</style>
