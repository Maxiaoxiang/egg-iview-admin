<style lang="less">
@import "./login.less";
</style>

<template>
    <div class="login">
        <div class="login-con">
            <Card icon="log-in" title="欢迎登录" :bordered="false">
                <div class="form-con">
                    <login-form @on-success-valid="handleSubmit" :loginLoading="loginLoading"></login-form>
                    <p class="login-tip"></p>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    LoginForm
  },
  data () {
    return {
      loginLoading: false
    }
  },
  created () {

  },
  methods: {
    ...mapActions(['handleLogin', 'getUserInfo', 'getUploadQiniuToken']),
    async handleSubmit ({ username, password }) {
      this.loginLoading = true;
      const res = await this.handleLogin({ username, password });
      this.loginLoading = false;
      if(res.data.code){
        this.$Message.error(res.data.msg);
        return false;
      }
      await this.getUserInfo();
      this.getUploadQiniuToken();
      this.$router.push({
        name: 'home'
      });
    }
  }
}
</script>

<style>
</style>
