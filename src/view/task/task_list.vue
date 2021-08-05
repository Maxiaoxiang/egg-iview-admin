<template>
  <div class="mod-list">
    <Row>
      <Col span="24">
        <Card dis-hover>
          <!-- 按钮-->
          <Row class="btn-group">
            <Button type="primary" icon="md-add" @click="robotStart('lianmishu')">运行任务</Button>
          </Row>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
  export default {
    data() {
      return {
      }
    },
    methods: {
      /**
       * @description 执行任务
       */
      robotStart(taskName) {
        this.api.post('/api/admin/task/', {
          task: taskName
        });
      },
    },
    mounted() {
    }
  }
</script>

<style>
</style>
