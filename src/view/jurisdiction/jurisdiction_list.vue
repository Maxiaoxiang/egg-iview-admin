import TreeTable from 'iview-tree-table';
<template>
  <div class="mod-list">
    <Row>
      <Col span="24">
        <Card dis-hover v-show="!isChildModelStatus">
          <!-- 搜索栏 -->
          <Row type="flex" justify="start">
            <Form label-position="top" inline @submit.native.prevent>
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
            <Button type="primary" icon="md-add" @click="toggleEditRoleModel('')" v-if="hasJurisdiction('admin_element_b879e4ea6528ba7c1c967de8b72b28c0')">新增资源</Button>
          </Row>
          <!-- 表格 -->
          <Row justify="center">
            <tree-table expand-key="title" :expand-type="false" :selectable="false" :columns="columns" :data="data" :border="true">
              <template slot="status" slot-scope="status">
                <span>{{status?'启用':'禁用'}}</span>
              </template>
              <template slot="handle" slot-scope="scope">
                <a @click="editRowData(scope)">编辑</a>
                <Divider type="vertical"/>
                <a @click="deleteRowData(scope)">删除</a>
                <Divider type="vertical" v-if="scope.row.parent_id !== 0"/>
                <a @click="addChildren(scope)" v-if="scope.row.parent_id !== 0">界面元素</a>
              </template>
            </tree-table>
          </Row>
        </Card>
        <!-- 界面元素操作 -->
        <Card dis-hover v-show="isChildModelStatus">
          <p slot="title">界面元素_{{currentSource.title}}</p>
          <Button slot="extra" type="primary" @click="addSourceChildren" style="margin-right: 10px;">新增</Button>
          <Button slot="extra" @click="closeAddChildrenModel">返回</Button>
          <Row justify="center">
            <tree-table expand-key="title" :expand-type="false" :selectable="false" :columns="columns" :data="currentListData" :border="true">
              <template slot="status" slot-scope="status">
                <span>{{status?'启用':'禁用'}}</span>
              </template>
              <template slot="handle" slot-scope="scope">
                <a @click="editRowData(scope)">编辑</a>
              </template>
            </tree-table>
          </Row>
        </Card>
        <!-- 修改资源弹窗 -->
        <Modal v-model="editRoleModel" title="编辑资源" :mask-closable="false">
          <Row>
            <Form ref="editRoleForm" :model="editRoleFormData" :rules="editRoleFormRules" :label-width="80">
              <FormItem label="父级资源" prop="parent_id">
                <TreeSelect :options="jurisdictionData" placeholder="请选择父级资源" :value="editRoleFormData.parent_id" @select="changeParent">
                  <div slot="option-label" slot-scope="{ node }">{{ node.raw.title }}</div>
                  <div slot="value-label" slot-scope="{ node }">{{ node.raw.title }}</div>
                </TreeSelect>
              </FormItem>
              <FormItem label="资源名称" prop="title">
                <Input type="text" placeholder="资源名称" v-model="editRoleFormData.title"/>
              </FormItem>
              <FormItem label="资源代码" prop="code">
                <Input type="text" placeholder="资源代码" disabled v-model="editRoleFormData.code"/>
              </FormItem>
              <FormItem label="前端路径" prop="path">
                <Input type="text" placeholder="前端路径" v-model="editRoleFormData.path"/>
              </FormItem>
              <FormItem label="图标" prop="icon">
                <Input type="text" placeholder="图标" v-model="editRoleFormData.icon"/>
              </FormItem>
              <FormItem label="描述" prop="description">
                <Input type="text" placeholder="描述" v-model="editRoleFormData.description"/>
              </FormItem>
              <FormItem label="备注" prop="remark">
                <Input type="text" placeholder="备注" v-model="editRoleFormData.remark"/>
              </FormItem>
              <FormItem label="排序" prop="order">
                <Input type="text" placeholder="排序" v-model="editRoleFormData.order"/>
              </FormItem>
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
      </Col>
    </Row>
  </div>
</template>

<script>
  import TreeSelect from '@riophae/vue-treeselect';
  import '@riophae/vue-treeselect/dist/vue-treeselect.css';
  import { mapActions } from 'vuex';

  export default {
    components: {
      TreeSelect
    },
    data() {
      return {
        // 搜索条件
        searchCondition: {
          date: '', //创建时间
          status: '', //状态
        },
        jurisdictionArray: [], //权限列表
        isChildModelStatus: false, //编辑界面元素
        jurisdictionData: [], //无分页权限列表
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
          parent_id: null, //父级
          path: '', //前端路径
          title: '', //标题
          remark: '', //备注
          description: '', //描述
          icon: '', //图标
          status: '启用', //状态
          order: undefined //排序
        },
        editRoleModelLoading: false, // 编辑商品弹窗按钮状态
        editRoleFormRules: {
          title: [{
            required: true,
            message: '请输入资源名称',
            trigger: 'blur'
          }],
          order: [{
            required: true,
            message: '请输入排序',
            trigger: 'blur'
          }]
        },
        currentSource: {}, //当前选中资源
        currentListData: [],
        data: [], // 数据
        columns: [{
          title: '资源名称',
          key: 'title',
        }, {
          title: '资源代码',
          key: 'code',
          width: '200'
        }, {
          title: '资源描述',
          key: 'description'
        }, {
          title: '排序',
          key: 'order',
          align: 'center',
          width: '50'
        }, {
          title: '状态',
          key: 'status',
          type: 'template',
          template: 'status',
          headerAlign: 'center',
          align: 'center',
          width: '80'
        }, {
          title: '编辑时间',
          key: 'update_time',
        }, {
          title: '操作',
          width: 180,
          type: 'template',
          template: 'handle'
        }],
        loading: false // 商品列表加载loading
      }
    },
    methods: {
      ...mapActions(['getButtonResourceList']),
      getNowButtonResourceList(){
        this.getButtonResourceList().then((data)=>{
          if(data) {
            for(let i of data){
              this.jurisdictionArray.push(i);
            }
          }
        })
      },
      hasJurisdiction(resourceCode){
        for(let i of this.jurisdictionArray){
          if(i === resourceCode){
            return true;
          }
        }
        return false
      },
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
        this.api.get('/api/admin/jurisdiction', {
          params: {
            ...params
          }
        }).then(res => {
          this.loading = false;
          if (res.data.code) {
            this.$Message.error(res.data.msg);
          } else {
            this.data = res.data.data;
            this.getJurisdictionListData();
          }
        })
      },
      /**
       * @description 获取权限列表
       */
      getJurisdictionListData(params) {
        this.api.get('/api/admin/jurisdiction', {
          params: params
        }).then(res => {
          this.loading = false;
          if (res.data.code) {
            this.$Message.error(res.data.msg);
          } else {
            if(!!params && params.hasOwnProperty('sourceCode')) {
              if(res.data.data.length > 0) {
                this.currentSource.children = res.data.data.map(item => {
                  if (item.children && item.children.length) {
                    item.children.forEach(children => {
                      if (!children.children.length) delete children.children;
                    });
                  } else {
                    delete item.children;
                  }
                  return item;
                });
              } else {
                delete this.currentSource.children;
              }
              this.jurisdictionData = [this.currentSource];
              this.currentListData = res.data.data;
            } else {
              this.jurisdictionData = res.data.data.map(item => {
                if (item.children && item.children.length) {
                  item.children.forEach(children => {
                    if (!children.children.length) delete children.children;
                  });
                } else {
                  delete item.children;
                }
                return item;
              });
            }
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
        if (this.editRoleModel) this.$refs.editRoleForm.resetFields(); //重置表单
      },
      /**
       * @description 编辑分类
       */
      submitAddRoleForm() {
        this.$refs.editRoleForm.validate(valid => {
          if (valid) {
            const params = JSON.parse(JSON.stringify(this.editRoleFormData));
            params.status = this.editRoleFormData.status === '启用' ? 1 : 0;
            delete params.id;
            if (this.handleType) { //编辑
              this.api.put('/api/admin/jurisdiction/' + this.editRoleFormData.id + '/', params).then(res => {
                if (res.data.code) {
                  this.$Message.error(res.data.msg);
                } else {
                  this.$Message.success(res.data.msg);
                  this.toggleEditRoleModel();
                  this.getListData();
                }
              });
            } else { //新增
              this.api.post('/api/admin/jurisdiction', params).then(res => {
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
          date: '',
          status: '',
        };
        this.$refs.date.handleClear(); //清空日期
        this.getListData();
      },
      /**
       * @description 编辑行
       */
      editRowData(params) {
        this.editRoleFormData = {...params.row};
        this.editRoleFormData.status = params.row.status === 1 ? '启用' : '禁用';
        this.toggleEditRoleModel('edit');
      },
      /**
       * @description 删除行
       */
      deleteRowData(params) {
        this.$Modal.confirm({
          title: '提示',
          content: `<p>确认删除【${params.row.title}】${params.row.children.length ? '及其所有子级' : ''}资源吗？</p>`,
          onOk: () => {
            this.api.delete(`/api/admin/jurisdiction/${params.row.id}/`).then(res => {
              if (res.data.code) {
                this.$Message.error(res.data.msg);
              } else {
                this.$Message.success(res.data.msg);
                this.getListData();
              }
            })
          }
        });
      },
      /**
       * @description 操作界面元素
       */
      addChildren(params) {
        this.isChildModelStatus = true;
        this.currentSource = params.row;
        this.getJurisdictionListData({sourceCode: params.row.code});
      },
      /**
       * @description 关闭操作界面元素
       */
      closeAddChildrenModel() {
        this.isChildModelStatus = false;
      },
      /**
       * @description 添加子资源
       */
      addSourceChildren() {
        this.toggleEditRoleModel();
      },
      /**
       * @description 选择父级资源
       */
      changeParent(node) {
        this.editRoleFormData.parent_id = node.id;
      }
    },
    mounted() {
      this.getListData();
      this.getNowButtonResourceList();
    }
  }
</script>

<style>
</style>
