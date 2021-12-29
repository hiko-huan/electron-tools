<template>
  <div>
    <h3>Tools Auto Get History</h3>
    <p>Component using elementUI:</p>
    <el-link target="_blank" type="primary" href="https://element-plus.org/en-US/component/button.html">https://element-plus.org/en-US/component/button.html</el-link>
    <el-button type="danger" @click="onTryIt">Vietcombank</el-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
const { ipcRenderer } = window.require("electron")

export default defineComponent({
  data () {
    return {
      count: 0
    }
  },
  methods: {
    onTryIt() {
      ipcRenderer.invoke('get_history', 'vietcombank')
      ipcRenderer.on('ok', (event, data) => {
        console.log('test', data)
      })
    }
  }
})
</script>

<style lang="scss" scoped></style>
