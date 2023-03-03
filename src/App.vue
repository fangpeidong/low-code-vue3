<template>
  <div id="app">
    <Editor />
  </div>
</template>

<script setup>
import { useDataStore } from './stores/data.js';
import { registerConfig } from './utils/editorConfig';
import Editor from './views/Editor.vue';
const store = useDataStore();
store.setData({
  container: {
    width: 550,
    height: 550
  },
  blocks: [
    {
      top: 100,
      left: 100,
      zIndex: 1,
      key: 'text',
      focus: false,
      alignCenter: false,
      width: 0,
      height: 0
    },
    {
      top: 200,
      left: 200,
      zIndex: 1,
      key: 'button',
      focus: false,
      alignCenter: false,
      width: 0,
      height: 0
    },
    {
      top: 300,
      left: 300,
      zIndex: 1,
      key: 'input',
      focus: false,
      alignCenter: false,
      width: 0,
      height: 0
    }
  ]
});
store.setConfig(registerConfig);
</script>

<style lang="scss" scoped>
#app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
