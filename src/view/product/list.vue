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
              <FormItem label="商品名称" prop="name">
                <Input clearable v-model="searchCondition.name" placeholder="商品名称"></Input>
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
            <Button type="primary" icon="md-add" @click="toggleAddProductModel()">新增商品</Button>
          </Row>
          <!-- 表格 -->
          <Row justify="center">
            <Col span="24">
              <Table :columns="productColumns" border :data="productData" :loading="loading" :disabled-hover="true"></Table>
            </Col>
          </Row>
          <div class="page">
            <Page :total="total" :current="searchCondition.page" @on-change="changePage" show-total show-elevator></Page>
          </div>
          <!-- 新增商品弹窗 -->
          <Modal v-model="addProductModel" title="添加商品" :mask-closable="false" :label-width="80">
            <Row>
              <Col span="24">
                <Form ref="addProductForm" :label-width="80" :model="addProductFormData" :rules="addProductFormRules">
                  <FormItem label="商品名称" prop="name">
                    <Input v-model="addProductFormData.name" placeholder="请输入商品名称"/>
                  </FormItem>
                  <FormItem label="商品描述">
                    <Input v-model="addProductFormData.description" placeholder="请输入商品描述"/>
                  </FormItem>
                  <FormItem label="状态">
                    <RadioGroup v-model="addProductFormData.publish_status" true-value="1" false-value="0">
                      <Radio label="1">上架</Radio>
                      <Radio label="0">下架</Radio>
                    </RadioGroup>
                  </FormItem>
                  <FormItem label="商品分类">
                    <Cascader :data="categoryList" v-model="addProductFormData.category_id" trigger="hover"></Cascader>
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
              </Col>
            </Row>
            <Row slot="footer">
              <Col span="24">
                <Button type="default" v-show="!addProductModelLoading" @click="toggleAddProductModel">取消</Button>
                <Button type="primary" :loading="addProductModelLoading" @click="submitAddProductForm">确定</Button>
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
          name: '', //商品名称
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
          label: '上架',
          value: '1'
        }, {
          label: '下架',
          value: '0'
        }],
        handleType: '', //编辑状态，''新增，'edit'编辑
        addProductModel: false, // 新增商品弹窗状态
        addProductFormData: {
          name: '', // 商品名称
          description: '', // 商品描述
          publish_status: '1', // 上架状态
          category_id: [], // 分类
          uploadList: [], // 上传列表
          uploadImgList: [],
          imgUrl: '', // 七牛上传完返回的图片路径
          imgId: '', // 服务端返回的图片关联id，用于提交表单
          defaultList: [], // 原数据
        },
        addProductModelLoading: false, // 新增商品弹窗按钮状态
        addProductFormRules: { // 商品校验规则
          name: [{
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }]
        },
        categoryList: [], // 商品分类
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
          title: '名称',
          key: 'name',
        }, {
          title: '描述',
          key: 'description',
          tooltip: true,
        }, {
          title: '分类',
          key: 'category_name',
          width: 100
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
                  open: () => h('span', '上架'),
                  close: () => h('span', '下架')
                },
                on: {
                  'on-change': value => {
                    // 上架/下架
                    this.api.put(`/api/admin/product/${params.row.id}/`, {publish_status: ~~value}).then(res => {
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
                      category_id: params.row['category_list'],
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
                      this.api.delete(`/api/admin/product/${params.row.id}/`).then(res => {
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
        this.api.get('/api/admin/product', {
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
                  if (item['id'] === id) {
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
                findNodeCategory(category, item['parent_id']);
              });
              item['category_list'] = [...categoryArr, item['parent_id']];
            });
            this.productData = result.data;
            this.total = result.count;
            this.loading = false;
          }
        })
      },
      /**
       * @description 获取商品分类列表
       */
      getCategoryList() {
        return new Promise(resolve => {
          this.api.get('/api/admin/product_category', {
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
       * @description 新增商品
       */
      async toggleAddProductModel(data) {
        this.handleType = data ? 'edit' : '';
        this.addProductFormData = data ? Object.assign({}, this.addProductFormData, data) : {
          name: '', // 商品名称
          description: '', // 商品描述
          publish_status: '1', // 上架状态
          category_id: [], // 分类
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
          content: '<img src="' + url + '" style="height:100%" alt>'
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
        let index = this.addProductFormData.uploadImgList.findIndex(item => item.url === file.url);
        this.addProductFormData.uploadImgList.splice(index, 1);
      },
      /**
       * @description 提交新增商品表单
       */
      submitAddProductForm() {
        this.$refs.addProductForm.validate(valid => {
          if (valid) {
            let params = {
              name: this.addProductFormData.name,
              description: this.addProductFormData.description,
              publish_status: this.addProductFormData.publish_status,
              category_id: this.addProductFormData.category_id.join(','),
              pic_hash: this.addProductFormData.imgId
            };
            if (this.handleType) { //修改
              this.api.put('/api/admin/product/' + this.addProductFormData.id + '/', params).then((res) => {
                if (!res.data.code) {
                  this.$Message.success(res.data.msg);
                  this.addProductModel = false;
                  this.getProductListData();
                } else {
                  this.$Message.error(res.data.msg);
                }
              });
            } else { //新增
              this.api.post('/api/admin/product/', params).then((res) => {
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
          name: '',
          date: '',
          publish_status: '',
          page: 1,
          limit: 10
        };
        this.$refs.date.handleClear(); //清空日期
        this.getProductListData();
      },
    },
    async created() {
      await this.getCategoryList();
      this.getProductListData();
    },
    mounted() {
    }
  }
</script>

<style>
</style>
