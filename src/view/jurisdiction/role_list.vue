<style lang="less">
  .tree-box {
    display: flex;
    margin-bottom: 24px;
    vertical-align: top;
    .ivu-form-item-label {
      width: 80px;
    }
  }
</style>
<template>
  <div class="mod-list">
    <Row>
      <Col span="24">
        <Card dis-hover>
          <!-- 搜索栏 -->
          <Row type="flex" justify="start">
            <Form label-position="top" inline @submit.native.prevent>
              <FormItem label="角色名称" prop="name">
                <Input clearable v-model="searchCondition.name" placeholder="角色名称"></Input>
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
            <Button type="primary" icon="md-add" @click="toggleEditRoleModel('')">新增角色</Button>
          </Row>
          <!-- 表格 -->
          <Row justify="center">
            <Table :columns="columns" border :data="data" :loading="loading" :disabled-hover="true"></Table>
          </Row>
          <div class="page">
            <Page :total="total" :current="searchCondition.page" @on-change="changePage" show-total show-elevator></Page>
          </div>
          <!-- 修改角色弹窗 -->
          <Modal v-model="editRoleModel" title="编辑角色" :mask-closable="false">
            <Row>
              <Form ref="editRoleForm" :model="editRoleFormData" :rules="editRoleFormRules" :label-width="80">
                <FormItem label="角色名称" prop="name">
                  <Input type="text" placeholder="角色名称" v-model="editRoleFormData.name"/>
                </FormItem>
                <div class="tree-box">
                  <label class="ivu-form-item-label">权限</label>
                  <Tree :data="jurisdictionData" ref="tree" :render="renderContent" show-checkbox></Tree>
                </div>
                <FormItem label="状态" prop="status">
                  <RadioGroup v-model="editRoleFormData.status">
                    <Radio label="启用"></Radio>
                    <Radio label="禁用"></Radio>
                  </RadioGroup>
                </FormItem>
              </Form>
            </Row>
            <Row slot="footer">
              <Button type="default" v-show="!editRoleModelLoading" @click="toggleEditRoleModel">取消</Button>
              <Button type="primary" :loading="editRoleModelLoading" @click="submitAddRoleForm">确定</Button>
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
          name: '', //角色名称
          date: '', //创建时间
          status: '', //状态
          page: 1,
          limit: 10
        },
        total: 0,
        jurisdictionDict: [], //权限资源字典
        jurisdictionData: [], //资源列表
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
        editRoleModel: false, // 编辑商品弹窗状态
        editRoleFormData: {
          name: '', // 分类名称
          status: '启用', //状态
        },
        editRoleModelLoading: false, // 编辑商品弹窗按钮状态
        editRoleFormRules: {
          name: [{
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }]
        },
        data: [], // 数据
        columns: [{ // 表头
          title: 'ID',
          key: 'id',
          sortable: true,
          width: 80,
          align: 'center'
        }, {
          title: '角色名称',
          key: 'name',
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
                    this.api.put(`/api/admin/role/${params.row.id}/`, {status: ~~value}).then(res => {
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
                    this.editRoleFormData = {...params.row};
                    this.editRoleFormData.status = params.row.status === 1 ? '启用' : '禁用';
                    this.updateJurisdictionSelected(params.row.jurisdiction);
                    this.toggleEditRoleModel('edit');
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
                      this.api.delete(`/api/admin/role/${params.row.id}/`).then(res => {
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
        this.api.get('/api/admin/role/', {
          params: {
            ...params
          }
        }).then(res => {
          this.loading = false;
          if (res.data.code) {
            this.$Message.error(res.data.msg);
          } else {
            this.data = res.data.data.data;
            this.total = res.data.data.count;
            this.loading = false;
          }
        })
      },
      /**
       * @description 新增分类
       * @param {String} type 操作类型
       */
      toggleEditRoleModel(type = '') {
        this.editRoleModel = !this.editRoleModel;
        this.handleType = type;
        if(this.editRoleModel) this.$refs.editRoleForm.resetFields(); //重置表单
      },
      renderContent (h, { root, node, data }) {
        return h('Option', {
            style: {
              display: 'inline-block',
              margin: '0'
            },
            props:{
              value: data.value
            }
          }, data.title);
      },
      /**
       * @description 编辑分类
       */
      submitAddRoleForm() {
        this.$refs.editRoleForm.validate(valid => {
          if (valid) {
            // 获取权限id数组
            const jurisdiction = this.$refs.tree.getCheckedNodes().map(item => {
              return item.id;
            });
            if(this.handleType) { //编辑
              this.api.put('/api/admin/role/' + this.editRoleFormData.id + '/', {
                name: this.editRoleFormData.name,
                jurisdiction: jurisdiction,
                status: this.editRoleFormData.status === '启用' ? 1 : 0
              }).then(res => {
                if (res.data.code) {
                  this.$Message.error(res.data.msg);
                } else {
                  this.$Message.success(res.data.msg);
                  this.toggleEditRoleModel();
                  this.getListData();
                }
              });
            } else { //新增
              this.api.post('/api/admin/role/', {
                name: this.editRoleFormData.name,
                jurisdiction: jurisdiction,
                status: this.editRoleFormData.status === '启用' ? 1 : 0
              }).then(res => {
                if (res.data.code) {
                  this.$Message.error(res.data.msg);
                } else {
                  this.$Message.success(res.data.msg);
                  this.toggleEditRoleModel();
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
          name: '',
          date: '',
          status: '',
          page: 1,
          limit: 10
        };
        this.$refs.date.handleClear(); //清空日期
        this.getListData();
      },
      /**
       * @description 获取无分页无子级权限列表
       */
      getJurisdictionDict() {
        this.api.get('/api/admin/jurisdiction/', {
          params: {
            page: 1,
            limit: 998,
            all: true
          }
        }).then(res => {
          if (res.data.code) {
            this.$Message.error(res.data.msg);
          } else {
            this.jurisdictionDict = res.data.data;
          }
        })
      },
      /**
       * @description 更新资源选中状态
       */
      updateJurisdictionSelected(jurisdiction) {
        this.jurisdictionData = JSON.parse(JSON.stringify(this.jurisdictionDict));
        this.jurisdictionData.forEach(item => {
          if(item.children && item.children.length){
            item.children.forEach(child => {
              let childSelected = jurisdiction.some(data => data.id === child.id);
              if(childSelected){
                child.checked = true;
              }
            });
          }
        });
      }
    },
    mounted() {
      this.getListData();
      this.getJurisdictionDict();
    }
  }
</script>

<style>
</style>
