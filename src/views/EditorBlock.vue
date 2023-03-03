<template>
  <div class="editor-block" :style="blockStyles" ref="blockRef">
    <RenderComponent :block="block" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useDataStore } from '../stores/data.js';
import RenderComponent from '../components/RenderComponent.vue';

const props = defineProps({
  block: {
    type: Object
  },
  index: {
    type: Number
  }
});

const store = useDataStore();

const blockRef = ref(null);

const blockStyles = computed(() => {
  return {
    top: props.block.top + 'px',
    left: props.block.left + 'px',
    zIndex: props.block.zIndex
  };
});

onMounted(() => {
  const { offsetWidth, offsetHeight } = blockRef.value;
  const block = { ...props.block };
  if (block.alignCenter) {
    block.left = block.left - offsetWidth / 2;
    block.top = block.top - offsetHeight / 2;
    block.alignCenter = false;
  }
  block.width = offsetWidth;
  block.height = offsetHeight;
  store.changeBlock(props.index, block);
});
</script>
