<style lang="less" scoped>
  @import "list.less";
</style>
<template>
  <div class="mod-list">
    <Row>
      <Col span="24">
        <Card dis-hover>
          <!-- 搜索栏 -->
          <Row type="flex" justify="start">
            <Form label-position="top" inline>
              <FormItem label="标题" prop="title">
                <Input clearable v-model="searchCondition.title" placeholder="标题"></Input>
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
                <Button type="primary" @click="submitSearchForm" icon="ios-search" class="search-btn" :loading="searchCondition.loading" v-if="hasJurisdiction('admin_element_f7505904711df4fee7537eaa1c6171a3')">搜索</Button>
                <Button type="default" class="search-btn" @click="resetSearchForm" v-if="hasJurisdiction('admin_element_3f5aee04b4600d09dfcceb81f970c838')">重置</Button>
              </FormItem>
            </Form>
          </Row>
          <div class="divider-line"></div>
          <!-- 按钮-->
          <Row class="btn-group">
            <Button type="primary" icon="md-add" @click="toggleAddProductModel()" v-if="hasJurisdiction('admin_element_d9f934a68dab2bfb60fc61e3c19cca28')">新增轮播图</Button>
          </Row>
          <!-- 表格 -->
          <Row justify="center">
            <Table :columns="productColumns" border :data="productData" :loading="loading" :disabled-hover="true"/>
          </Row>
          <div class="page">
            <Page :total="total" :current="searchCondition.page" @on-change="changePage" show-total show-elevator/>
          </div>
          <!-- 新增弹窗 -->
          <Modal v-model="addProductModel" title="编辑" :mask-closable="false" :label-width="80">
            <Row>
              <Form ref="addProductForm" :label-width="80" :model="addProductFormData" :rules="addProductFormRules">
                <FormItem label="标题" prop="title">
                  <Input v-model="addProductFormData.title" placeholder="请输入轮播图标题"/>
                </FormItem>
                <FormItem label="链接" prop="url">
                  <Input v-model="addProductFormData.url" placeholder="请输入跳转链接"/>
                </FormItem>
                <FormItem label="状态">
                  <RadioGroup v-model="addProductFormData.publish_status" true-value="1" false-value="0">
                    <Radio label="1">启用</Radio>
                    <Radio label="0">禁用</Radio>
                  </RadioGroup>
                </FormItem>
                <FormItem label="上传图片">
                  <div class="demo-upload-list" v-for="item in addProductFormData.uploadImgList" :key="item.url">
                    <template v-if="item.status === 'finished'">
                      <img :src="item.url">
                      <div class="demo-upload-list-cover">
                        <Icon type="ios-eye-outline" @click.native="uploadImgHandleView(item.url)"></Icon>
                        <Icon type="ios-trash-outline" @click.native="uploadImgHandleRemove(item)"></Icon>
                      </div>
                    </template>
                    <template v-else>
                      <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                    </template>
                  </div>
                  <Upload
                    ref="upload"
                    :data="{token: qiniuToken}"
                    :show-upload-list="false"
                    :default-file-list="addProductFormData.defaultList"
                    :before-upload="getQiNiuToken"
                    :on-success="uploadImgSuccessCallback"
                    :format="['jpg','jpeg','png']"
                    :max-size="2048"
                    type="drag"
                    :on-format-error="uploadImgHandleFormatError"
                    :on-exceeded-size="uploadImgHandleMaxSize"
                    action="//upload-z2.qiniup.com"
                    style="display: inline-block;width:58px;">
                    <div style="width: 58px;height:58px;line-height: 58px;">
                      <Icon type="ios-camera" size="20"></Icon>
                    </div>
                  </Upload>
                </FormItem>
              </Form>
            </Row>
            <Row slot="footer">
              <Button type="default" v-show="!addProductModelLoading" @click="toggleAddProductModel">取消</Button>
              <Button type="primary" :loading="addProductModelLoading" @click="submitAddProductForm">确定</Button>
            </Row>
          </Modal>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>

  import {mapActions} from "vuex";

  export default {
    data() {
      return {
        qiniuToken: '', //七牛token
        // 搜索条件
        searchCondition: {
          title: '',
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
        jurisdictionArray: [],
        handleType: '', //编辑状态，''新增，'edit'编辑
        addProductModel: false, // 新增商品弹窗状态
        addProductFormData: {
          title: '', // 轮播图标题
          url: '', //跳转链接
          publish_status: '1', // 上架状态
          uploadList: [], // 上传列表
          uploadImgList: [],
          imgUrl: '', // 七牛上传完返回的图片路径
          imgId: '', // 服务端返回的图片关联id，用于提交表单
          defaultList: [], // 原数据
        },
        addProductModelLoading: false, // 新增商品弹窗按钮状态
        addProductFormRules: { // 商品校验规则
          title: [{
            required: true,
            message: '请输入轮播图标题',
            trigger: 'blur'
          }]
        },
        loading: false, // 商品列表加载loading
        // 商品数据
        productData: [],
        // 商品表头
        productColumns: [{
          title: 'ID',
          key: 'id',
          sortable: true,
          width: 80,
          align: 'center'
        }, {
          title: '标题',
          key: 'title',
        }, {
          title: '跳转',
          key: 'url',
          tooltip: true,
        }, {
          title: '缩略图',
          key: 'pic_url',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: this.$config.baseUrl.pic + params.row['pic_url'],
                style: 'width: 40px;vertical-align: middle;object-fit: contain;'
              }
            })
          }
        }, {
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
                    this.api.put(`/api/admin/banner/${params.row.id}/`, {publish_status: ~~value}).then(res => {
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
                    let list = [];
                    list.push({
                      status: 'finished',
                      url: this.$config.baseUrl.pic + params.row['pic_url'],
                      name: params.row['pic_url']
                    });
                    let data = Object.assign({}, params.row, {
                      publish_status: params.row['publish_status'].toString(),
                      uploadImgList: list
                    });
                    this.toggleAddProductModel(data);
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
                      this.api.delete(`/api/admin/banner/${params.row.id}/`).then(res => {
                        if (res.data.code) {
                          this.$Message.error(res.data.msg);
                        } else {
                          this.$Message.success(res.data.msg);
                          this.getProductListData();
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
       * 切换页码
       */
      changePage(num) {
        this.searchCondition.page = num;
        this.getProductListData();
      },
      /**
       * @description 切换日期
       */
      changeDate(datetime) {
        this.searchCondition.date = datetime;
      },
      /**
       * @description 获取商品列表数据
       */
      getProductListData() {
        let params = JSON.parse(JSON.stringify(this.searchCondition));
        delete params.date;
        if (this.searchCondition.date.length > 1 && this.searchCondition.date[0]) {
          params.startDate = this.searchCondition.date[0];
          params.endDate = this.searchCondition.date[1];
        }
        this.loading = true;
        this.api.get('/api/admin/banner/', {
          params: {
            ...params
          }
        }).then(res => {
          if (res.data.code) {
            this.$Message.error(res.data.msg);
          } else {
            this.productData = res.data.data.data;
            this.total = res.data.data.count;
            this.loading = false;
          }
        })
      },
      /**
       * @description 新增商品
       */
      toggleAddProductModel(data) {
        this.handleType = data ? 'edit' : '';
        this.addProductFormData = data ? Object.assign({}, this.addProductFormData, data) : {
          title: '', // 标题
          url: '', // 跳转链接
          publish_status: '1', // 上架状态
          uploadList: [], // 上传列表
          uploadImgList: [],
          imgUrl: '', // 七牛上传完返回的图片路径
          imgId: '', // 服务端返回的图片关联id，用于提交表单
          defaultList: [], // 原数据
        };
        this.$refs.addProductForm.resetFields(); //重置表单
        this.addProductModel = !this.addProductModel;
      },
      /**
       * @description 上传图片成功回调
       * @param res {Object} callback
       */
      uploadImgSuccessCallback(res) {
        if (res.key) {
          if (this.addProductModel) {
            this.addProductFormData.imgId = res.hash;
            this.addProductFormData.uploadImgList.push({
              name: res.hash,
              url: this.$config.baseUrl.pic + res.key,
              status: 'finished'
            });
          }
        } else {
          this.$Notice.warning({
            title: '错误',
            desc: '上传图片失败，请联系管理员'
          });
        }
      },
      /**
       * @description 查看缩略图
       */
      uploadImgHandleView(url) {
        this.$Modal.info({
          title: "查看图片",
          content: '<div style="width:100%;"><img src="' + url + '" style="width:100%" alt></div>'
        });
      },
      /**
       * @description 上传图片格式校验
       * @param file
       */
      uploadImgHandleFormatError(file) {
        this.$Notice.warning({
          title: '错误提醒',
          desc: '文件：' + file.name + '格式不正确，请上传jpg/jpeg/png格式'
        });
      },
      /**
       * @description 上传图片文件大小校验
       * @param file
       */
      uploadImgHandleMaxSize(file) {
        this.$Notice.warning({
          title: '错误提醒',
          desc: '文件：' + file.name + '过大，请上传2M以内大小的图片'
        });
      },
      /**
       * @description 移除文件
       * @param file
       */
      uploadImgHandleRemove(file) {
        const fileList = this.$refs.upload.fileList;
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
      },
      /**
       * @description 提交新增商品表单
       */
      submitAddProductForm() {
        this.$refs.addProductForm.validate(valid => {
          if (valid) {
            if(this.handleType){
              this.api.put('/api/admin/banner/' + this.addProductFormData.id + '/', {
                title: this.addProductFormData.title,
                url: this.addProductFormData.url,
                publish_status: this.addProductFormData.publish_status,
                pic_url: this.addProductFormData.imgId
              }).then((res) => {
                if (!res.data.code) {
                  this.$Message.success(res.data.msg);
                  this.addProductModel = false;
                  this.getProductListData();
                } else {
                  this.$Message.error(res.data.msg);
                }
              });
            } else {
              this.api.post('/api/admin/banner/', {
                title: this.addProductFormData.title,
                url: this.addProductFormData.url,
                publish_status: this.addProductFormData.publish_status,
                pic_url: this.addProductFormData.imgId
              }).then((res) => {
                if (!res.data.code) {
                  this.$Message.success(res.data.msg);
                  this.addProductModel = false;
                  this.getProductListData();
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
        this.getProductListData();
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
        this.getProductListData();
      },
      //获取七牛云token
      getQiNiuToken() {
        return new Promise((resolve, reject) => {
          this.api.get('/api/admin/token/').then(res => {
            if(res.data.code === 0) {
              this.qiniuToken = res.data.data.token;
              resolve(res);
            } else {
              reject(res);
            }
          }).catch(e => {reject(e)});
        });
      }
    },
    async created() {
      this.getProductListData();
      this.getNowButtonResourceList();
    },
    mounted() {
    }
  }
</script>

<style>
</style>
