<style lang="less">
</style>
<template>
  <div class="mod-list">
    <Row>
      <Col span="24">
        <Card dis-hover>
          <!-- 搜索栏 -->
          <Row type="flex" justify="start">
            <Form label-position="top" inline @submit.native.prevent>
              <FormItem label="分类名称" prop="category_name">
                <Input clearable v-model="searchCondition.category_name" placeholder="分类名称"></Input>
              </FormItem>
              <FormItem label="创建时间" prop="date">
                <DatePicker type="daterange" @on-change="(datetime)=>{changeDate(datetime)}" placeholder="创建时间" ref="date"></DatePicker>
              </FormItem>
              <FormItem label="状态" prop="status">
                <Select v-model="searchCondition.status">
                  <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
              <FormItem label="  ">
                <Button type="primary" @click="submitSearchForm" icon="ios-search" class="search-btn" :loading="loading">搜索</Button>
                <Button type="default" class="search-btn" @click="resetSearchForm">重置</Button>
              </FormItem>
            </Form>
          </Row>
          <div class="divider-line"></div>
          <!-- 按钮-->
          <Row class="btn-group">
            <Button type="primary" icon="md-add" @click="toggleEditCategoryModel('')">新增分类</Button>
          </Row>
          <!-- 表格 -->
          <Row justify="center">
            <Table :columns="categoryColumns" border :data="categoryData" :loading="loading" :disabled-hover="true"></Table>
          </Row>
          <div class="page">
            <Page :total="total" :current="searchCondition.page" @on-change="changePage" show-total show-elevator></Page>
          </div>
          <!-- 修改分类弹窗 -->
          <Modal v-model="editCategoryModel" title="编辑分类" :mask-closable="false">
            <Row>
              <Form ref="editCategoryForm" :model="editCategoryFormData" :rules="editCategoryFormRules" :label-width="80">
                <FormItem label="父级分类" prop="parent_id">
                  <Select v-model="editCategoryFormData.parent_id" filterable>
                    <Option v-for="item in categoryData" :value="item.id" :key="item.id">{{ item.category_name }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="分类名称" prop="category_name">
                  <Input type="text" placeholder="请输入分类名称" v-model="editCategoryFormData.category_name"/>
                </FormItem>
                <FormItem prop="status">
                  <RadioGroup v-model="editCategoryFormData.status">
                    <Radio label="启用"></Radio>
                    <Radio label="禁用"></Radio>
                  </RadioGroup>
                </FormItem>
              </Form>
            </Row>
            <Row slot="footer">
              <Button type="default" v-show="!editCategoryModelLoading" @click="toggleEditCategoryModel">取消</Button>
              <Button type="primary" :loading="editCategoryModelLoading" @click="submitAddCategoryForm">确定</Button>
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
          category_name: '', //商品名称
          date: '', //注册时间
          status: '', //状态
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
        handleType: '', //操作状态
        editCategoryModel: false, // 编辑商品弹窗状态
        editCategoryFormData: {
          category_name: '', // 分类名称
          status: '启用', //状态
          parent_id: '' // 父级分类id
        },
        editCategoryModelLoading: false, // 编辑商品弹窗按钮状态
        editCategoryFormRules: {
          category_name: [{
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }]
        },
        // 商品数据
        categoryData: [],
        // 商品表头
        categoryColumns: [{
          title: 'ID',
          key: 'id',
          sortable: true,
          width: 80,
          align: 'center'
        }, {
          title: '分类名称',
          key: 'category_name',
        }, {
          title: '父级分类',
          key: 'parent_name',
        }, {
          title: '创建时间',
          key: 'create_time',
        }, {
          title: '状态',
          key: 'status',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('i-switch', {
                props: {
                  type: 'primary',
                  size: 'large',
                  value: params.row.status === 1 // 控制开关的打开或关闭状态
                },
                scopedSlots: {
                  open: () => h('span', '启用'),
                  close: () => h('span', '禁用')
                },
                on: {
                  'on-change': value => {
                    // 启用/禁用
                    this.api.put(`/api/admin/article_category/${params.row.id}/`, {status: ~~value}).then(res => {
                      if (res.data.code) {
                        this.$Message.error(res.data.msg);
                      } else {
                        params.row.status = ~~value; //更新行数据状态
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
                    this.editCategoryFormData = {...params.row};
                    this.editCategoryFormData.status = params.row.status === 1 ? '启用' : '禁用';
                    this.toggleEditCategoryModel('edit');
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
                      this.api.delete(`/api/admin/article_category/${params.row.id}/`).then(res => {
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
        }],
        loading: false // 商品列表加载loading
      }
    },
    methods: {
      /**
       * @description 获取分类列表数据
       */
      getListData() {
        let params = JSON.parse(JSON.stringify(this.searchCondition));
        delete params.date;
        if (this.searchCondition.date.length > 1 && this.searchCondition.date[0]) {
          params.startDate = this.searchCondition.date[0];
          params.endDate = this.searchCondition.date[1];
        }
        this.loading = true;
        this.api.get('/api/admin/article_category/', {
          params: {
            ...params
          }
        }).then(res => {
          this.loading = false;
          if (res.data.code) {
            this.$Message.error(res.data.msg);
          } else {
            this.categoryData = res.data.data.data;
            this.total = res.data.data.count;
            this.loading = false;
          }
        })
      },
      /**
       * @description 新增分类
       * @param {String} type 操作类型
       */
      toggleEditCategoryModel(type = '') {
        this.editCategoryModel = !this.editCategoryModel;
        this.handleType = type;
        if(this.editCategoryModel) this.$refs.editCategoryForm.resetFields(); //重置表单
      },
      /**
       * @description 编辑分类
       */
      submitAddCategoryForm() {
        this.$refs.editCategoryForm.validate(valid => {
          if (valid) {
            if(this.handleType) { //编辑
              this.api.put('/api/admin/article_category/' + this.editCategoryFormData.id + '/', {
                category_name: this.editCategoryFormData.category_name,
                parent_id: this.editCategoryFormData.parent_id,
                status: this.editCategoryFormData.status === '启用' ? 1 : 0
              }).then(res => {
                if (res.data.code) {
                  this.$Message.error(res.data.msg);
                } else {
                  this.$Message.success(res.data.msg);
                  this.toggleEditCategoryModel();
                  this.getListData();
                }
              });
            } else { //新增
              this.api.post('/api/admin/article_category/', {
                category_name: this.editCategoryFormData.category_name,
                parent_id: this.editCategoryFormData.parent_id,
                status: this.editCategoryFormData.status === '启用' ? 1 : 0
              }).then(res => {
                if (res.data.code) {
                  this.$Message.error(res.data.msg);
                } else {
                  this.$Message.success(res.data.msg);
                  this.toggleEditCategoryModel();
                  this.getListData();
                }
              });
            }
          }
        })
      },
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
          category_name: '',
          date: '',
          status: '',
          page: 1,
          limit: 10
        };
        this.$refs.date.handleClear(); //清空日期
        this.getListData();
      },
    },
    mounted() {
      this.getListData()
    }
  }
</script>

<style>
</style>
