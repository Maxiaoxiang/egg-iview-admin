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
              <FormItem label="用户名" prop="username">
                <Input clearable v-model="searchCondition.username" placeholder="用户名"></Input>
              </FormItem>
              <FormItem label="注册时间" prop="date">
                <DatePicker type="daterange" @on-change="(datetime)=>{changeDate(datetime)}" placeholder="注册时间" ref="date"></DatePicker>
              </FormItem>
              <FormItem label="状态" prop="status">
                <Select v-model="searchCondition.status">
                  <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
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
            <Button type="primary" icon="md-add" @click="toggleAddUserModel">新增用户</Button>
          </Row>
          <!-- 表格 -->
          <Row justify="center">
            <Table :columns="columns" border :data="tableData" :loading="loading" :disabled-hover="true"></Table>
          </Row>
          <div class="page">
            <Page :total="total" :current="searchCondition.page" @on-change="changePage" show-total show-elevator></Page>
          </div>
          <!-- 新增用户弹窗 -->
          <Modal v-model="addUserModel" title="新增用户" :mask-closable="false">
            <Row>
              <Form ref="addUserForm" :model="addUserFormData" :rules="addUserFormRules" :label-width="80">
                <FormItem prop="username" label="用户名">
                  <Input v-model="addUserFormData.username" type="text" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入用户名"/>
                </FormItem>
                <FormItem prop="name" label="名称">
                  <Input v-model="addUserFormData.name" type="text" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入名称"/>
                </FormItem>
                <FormItem label="密码" prop="password">
                  <Input clearable type="password" v-model="addUserFormData.password" placeholder="密码"></Input>
                </FormItem>
                <FormItem label="角色" prop="role_id">
                  <Select v-model="addUserFormData.role_id" filterable>
                    <Option v-for="item in roleData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                  </Select>
                </FormItem>
                <FormItem label prop="status">
                  <RadioGroup v-model="addUserFormData.status">
                    <Radio label="启用"></Radio>
                    <Radio label="禁用"></Radio>
                  </RadioGroup>
                </FormItem>
              </Form>
            </Row>
            <Row slot="footer">
              <Button type="default" v-show="!addUserModelLoading" @click="toggleAddUserModel">取消</Button>
              <Button type="primary" :loading="addUserModelLoading" @click="sureAddUserModel">确定</Button>
            </Row>
          </Modal>
          <!-- 修改用户弹窗 -->
          <Modal v-model="editUserModel" title="编辑用户" :mask-closable="false">
            <Row>
              <Form ref="editUserForm" :model="editUserFormData" :rules="editUserFormRules" :label-width="80">
                <FormItem label="用户名">
                  <Input v-model="editUserFormData.username" disabled type="text"/>
                </FormItem>
                <FormItem prop="name" label="名称">
                  <Input v-model="editUserFormData.name" type="text" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入名称"/>
                </FormItem>
                <FormItem label="新密码" prop="password">
                  <Input clearable type="password" v-model="editUserFormData.password" placeholder="新密码"></Input>
                </FormItem>
                <FormItem label="角色" prop="role_id">
                  <Select v-model="editUserFormData.role_id" filterable>
                    <Option v-for="item in roleData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Form>
            </Row>
            <Row slot="footer">
              <Button type="default" v-show="!editUserModelLoading" @click="toggleEditUserModel">取消</Button>
              <Button type="primary" :loading="editUserModelLoading" @click="sureEditUserModel">确定</Button>
            </Row>
          </Modal>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
  import md5 from 'js-md5'

  export default {
    name: 'user_list',
    components: {},
    data() {
      return {
        // 搜索条件
        searchCondition: {
          username: '', //用户名
          name: '', //名称
          date: '', //注册时间
          status: '', //状态
          page: 1,
          limit: 10
        },
        total: 0,
        roleData: [], //角色列表
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
        // 添加用户
        addUserFormData: {
          username: '',
          name: '',
          password: '',
          status: '启用',
          role_id: ''
        },
        addUserModelLoading: false, // 新增用户表单loading状态
        addUserModel: false, // 新增用户弹窗状态
        addUserFormRules: {
          // 新增用户表单校验规则
          username: [
            {
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            }
          ],
          name: [
            {
              required: true,
              message: '请输入名称',
              trigger: 'blur'
            }
          ],
          password: [
            {
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            }
          ],
          role_id: [
            {
              required: true,
              message: '请选择角色',
              trigger: 'change'
            }
          ],
        },
        // 编辑用户
        editUserFormData: {
          id: '',
          username: '',
          name: '',
          password: '',
          role_id: ''
        },
        editUserModelLoading: false, // 编辑用户表单loading状态
        editUserModel: false, // 编辑用户弹窗状态
        editUserFormRules: {
          // 编辑用户表单校验规则
          name: [
            {
              required: true,
              message: '请输入名称',
              trigger: 'blur'
            }
          ],
          password: [
            {
              required: true,
              message: '请输入新密码',
              trigger: 'blur'
            }
          ],
          role_id: [
            {
              required: true,
              message: '请选择角色',
              trigger: 'change'
            }
          ],
        },
        loading: true, // 表格loading
        columns: [
          {
            title: 'ID',
            key: 'id',
            sortable: true,
            width: 80,
            align: 'center'
          },
          {title: '用户名', key: 'username'},
          {title: '名称', key: 'name'},
          {title: '角色', key: 'role_name'},
          {title: '注册时间', key: 'create_time'},
          {title: '最后编辑时间', key: 'update_time'},
          {
            title: '状态',
            key: 'status',
            width: 100,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    display: params.row.id === 1 ? 'block' : 'none',
                    color: '#999999'
                  }
                }, '启用'),
                h('i-switch', {
                  props: {
                    type: 'primary',
                    size: 'large',
                    value: params.row.status === 1 // 控制开关的打开或关闭状态
                  },
                  style: {
                    display: params.row.id !== 1 ? 'inline-block' : 'none'
                  },
                  scopedSlots: {
                    open: () => h('span', '启用'),
                    close: () => h('span', '禁用')
                  },
                  on: {
                    'on-change': value => {
                      // 启用/禁用
                      this.api.put(`/api/admin/user/${params.row.id}/`, {status: ~~value}).then(res => {
                        if (res.data.code) {
                          this.$Message.error(res.data.msg);
                        }
                      });
                    }
                  }
                })
              ])
            }
          },
          {
            title: '操作',
            width: 160,
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    display: params.row.id === 1 ? 'block' : 'none',
                    color: '#999999'
                  }
                }, '管理员不可编辑'),
                h('a', {
                  style: {
                    display: params.row.id !== 1 ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.editUserFormData = {
                        id: params.row.id,
                        username: params.row.username,
                        name: params.row.name,
                        role_id: params.row.role_id.toString()
                      };
                      this.editUserModel = true;
                    }
                  }
                }, '编辑'),
                h('Divider', {
                  props: {
                    type: 'vertical'
                  },
                  style: {
                    display: params.row.id !== 1 ? 'inline-block' : 'none'
                  }
                }),
                h('a', {
                    style: {
                      display: params.row.id !== 1 ? 'inline-block' : 'none'
                    }
                  },
                  [h('Poptip', {
                    props: {
                      confirm: true,
                      title: '确定要删除吗？',
                      type: 'error',
                      size: 'small',
                      transfer: true
                    },
                    on: {
                      'on-ok': () => {
                        this.api.delete(`/api/admin/user/${params.row.id}/`).then(res => {
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
          }
        ],
        tableData: []
      }
    },
    methods: {
      /**
       * @description 打开添加用户弹窗
       */
      toggleAddUserModel() {
        this.addUserModel = !this.addUserModel;
        if(this.addUserModel) { // 重置表单
          this.$refs.addUserForm.resetFields();
          this.addUserFormData = {
            username: '',
            name: '',
            password: '',
            role_id: '',
            status: '启用'
          }
        }
      },
      toggleEditUserModel() {
        this.editUserModel = !this.editUserModel;
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
       * @description 新增用户
       */
      sureAddUserModel() {
        this.$refs.addUserForm.validate(valid => {
          if (valid) {
            this.api.post('/api/admin/user/', {
              username: this.addUserFormData.username,
              name: this.addUserFormData.name,
              password: md5(this.addUserFormData.password),
              status: this.addUserFormData.status === '启用' ? 1 : 0,
              role_id: this.addUserFormData.role_id,
            }).then(res => {
              if (res.data.code) {
                this.$Message.error(res.data.msg)
              } else {
                this.$Message.success(res.data.msg);
                this.toggleAddUserModel();
                this.getListData();
              }
            })
          }
        })
      },
      /**
       * @description 修改用户
       */
      sureEditUserModel() {
        this.$refs.editUserForm.validate(valid => {
          if (valid) {
            this.api.put(`/api/admin/user/${this.editUserFormData.id}/`, {
              password: md5(this.editUserFormData.password),
              name: this.editUserFormData.name,
              role_id: this.addUserFormData.role_id,
            }).then(res => {
              if (res.data.code) {
                this.$Message.error(res.data.msg);
              } else {
                this.$Message.success(res.data.msg);
                this.toggleEditUserModel();
                this.getListData();
              }
            });
          }
        });
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
          username: '',
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
        this.api.get('/api/admin/user/', {
          params: {
            ...params
          }
        }).then(res => {
          if (res.data.code) {
            this.$Message.error(res.data.msg);
          } else {
            this.tableData = res.data.data.data;
            this.total = res.data.data.count;
            this.loading = false;
          }
        })
      },
      /**
       * @description 获取角色列表
       */
      getRoleList(){
        this.api.get('/api/admin/role', {
          params: {
            limit: 999
          }
        }).then(res => {
          this.roleData = res.data.data.map(item => {
            item.id = item.id.toString();
            return item;
          });
        });
      }
    },
    mounted() {
      this.getListData();
      this.getRoleList();
    }
  }
</script>

<style>
</style>
