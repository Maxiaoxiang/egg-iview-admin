<template>
  <div class="editor-wrapper">
    <div :id="editorId"></div>
  </div>
</template>

<script>
  import Editor from 'wangeditor'
  import 'wangeditor/release/wangEditor.min.css'
  import {oneOf} from '@/libs/tools'
  import * as qiniu from 'qiniu-js'

  export default {
    name: 'Editor',
    props: {
      value: {
        type: String,
        default: ''
      },
      /**
       * 绑定的值的类型, enum: ['html', 'text']
       */
      valueType: {
        type: String,
        default: 'html',
        validator: (val) => {
          return oneOf(val, ['html', 'text']);
        }
      },
      /**
       * @description 设置change事件触发时间间隔
       */
      changeInterval: {
        type: Number,
        default: 200
      },
      /**
       * @description 是否开启本地存储
       */
      cache: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      editorId() {
        return `editor${this._uid}`;
      }
    },
    methods: {
      setHtml(val) {
        this.editor.txt.html(val);
      },
    },
    mounted() {
      const vm = this;
      this.editor = new Editor(`#${this.editorId}`);
      this.editor.customConfig.onchange = (html) => {
        let text = this.editor.txt.text();
        if (this.cache) localStorage.editorCache = html;
        this.$emit('input', this.valueType === 'html' ? html : text);
        this.$emit('on-change', html, text);
      };
      this.editor.customConfig.onchangeTimeout = this.changeInterval;
      // this.editor.customConfig.uploadImgShowBase64 = true; //base64上传
      this.editor.customConfig.uploadImgServer = '/api/upload'; //服务端上传
      // this.editor.customConfig.qiniu = true; // 允许上传到七牛云存储
      this.editor.customConfig.uploadImgHooks = { //自定义上传钩子
        customInsert: function (insertImg, result, editor) {
          let url = vm.$config.baseUrl.pic + result.data;
          insertImg(url);
        }
      };
      // create这个方法一定要在所有配置项之后调用
      this.editor.create();
      // 如果本地有存储加载本地存储内容
      // let html = this.value || localStorage.editorCache;
      // if (html) this.editor.txt.html(html);
      if (this.value) this.editor.txt.html(this.value);
    }
  }
</script>

<style lang="less">
  .editor-wrapper * {
    z-index: 100 !important;
  }

  .w-e-menu {
    z-index: 2 !important;
  }

  .w-e-text-container {
    z-index: 1 !important;
  }
</style>
