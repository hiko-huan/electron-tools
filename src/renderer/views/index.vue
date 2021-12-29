<template>
  <div>
    <h3>Tools Auto Get History</h3>
    <p>Count: {{ count }}</p>
    <button @click="onTryIt">Try it</button>
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
      ipcRenderer.invoke('test')
    }
  }
})
</script>

<style></style>
