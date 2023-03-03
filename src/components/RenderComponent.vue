<template>
  <div v-if="block.key === 'text'">text</div>
  <ElButton v-if="block.key === 'button'">button</ElButton>
  <ElInput v-if="block.key === 'input'" placeholder="请输入内容" />
</template>

<script setup>
import { ElButton, ElInput } from 'element-plus';

defineProps({
  block: {
    type: Object
  }
});
</script>
