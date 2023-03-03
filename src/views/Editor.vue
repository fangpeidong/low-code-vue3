<template>
  <div class="editor">
    editor-top
    <div class="editor-left">
      <div
        class="editor-left-item"
        :draggable="true"
        v-for="(component, index) in store.config.componentList"
        :key="index"
        @dragstart="(e) => dragStart(e, component)"
        @dragend="(e) => dragEnd(e)"
      >
        <div class="tag">{{ component.label }}</div>
        <RenderComponent :block="component" />
      </div>
    </div>
    <div class="editor-top">
      <ElButton>撤销</ElButton>
      <ElButton>重做</ElButton>
    </div>
    <div class="editor-right">右侧属性控制</div>

    <div class="editor-container">
      <!-- 滚动条 -->
      <div class="editor-container-canvas">
        <!-- 内容区 -->
        <div
          class="editor-container-canvas__content"
          :style="store.containerStyles"
          ref="containerRef"
          @mousedown="containerMouseDown"
        >
          <div v-for="(block, index) in store.data.blocks" :key="index">
            <EditorBlock
              :class="[block.focus ? 'editor-block--focus' : null]"
              :block="block"
              :index="index"
              @mousedown="(e) => blockMouseDown(e, block, index)"
            />
            <div
              class="line-x"
              :style="{ left: markLine.x + 'px' }"
              v-if="markLine.x !== null"
            ></div>
            <div
              class="line-y"
              :style="{ top: markLine.y + 'px' }"
              v-if="markLine.y !== null"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { ElButton } from 'element-plus';
import { useDataStore } from '../stores/data.js';
import EditorBlock from './EditorBlock.vue';
import RenderComponent from '../components/RenderComponent.vue';

const store = useDataStore();

const containerRef = ref(null);
let currentComponent = null;

const selectIndex = ref(-1); // 最后选择的索引

const markLine = reactive({
  x: null,
  y: null
});

const lastSelectBlock = computed(() => store.data.blocks[selectIndex.value]); // 最后选择的区块

const focusData = computed(() => {
  let focus = [];
  let unfocused = [];
  store.data.blocks.forEach((block) => {
    if (block.focus) {
      focus.push(block);
    } else {
      unfocused.push(block);
    }
  });

  return {
    focus,
    unfocused
  };
});

function dragStart(e, component) {
  containerRef.value.addEventListener('dragenter', dragEnter);
  containerRef.value.addEventListener('dragover', dragOver);
  containerRef.value.addEventListener('dragleave', dragLeave);
  containerRef.value.addEventListener('drop', drop);
  currentComponent = component;
}

function dragEnter(e) {
  e.dataTransfer.dropEffect = 'move';
}

function dragOver(e) {
  e.preventDefault();
}

function dragLeave(e) {
  e.dataTransfer.dropEffect = 'none';
}

function dragEnd(e) {
  containerRef.value.removeEventListener('dragenter', dragEnter);
  containerRef.value.removeEventListener('dragover', dragOver);
  containerRef.value.removeEventListener('dragleave', dragLeave);
  containerRef.value.removeEventListener('drop', drop);
}

function drop(e) {
  let blocks = [...store.data.blocks];
  blocks = [
    ...blocks,
    {
      top: e.offsetY,
      left: e.offsetX,
      zIndex: 1,
      key: currentComponent.key,
      alignCenter: true
    }
  ];
  store.changeBlocks(blocks);

  currentComponent = null;
}

function clearBlockFocus() {
  const blocks = [...store.data.blocks];
  blocks.forEach((block) => (block.focus = false));
  store.changeBlocks(blocks);
}

function blockMouseDown(e, block, index) {
  e.preventDefault();
  e.stopPropagation();
  const newBlock = { ...block };
  if (e.shiftKey) {
    if (focusData.value.focus.length <= 1) {
      newBlock.focus = true;
    } else {
      newBlock.focus = !newBlock.focus;
    }
  } else {
    if (!newBlock.focus) {
      clearBlockFocus();
      newBlock.focus = true;
    }
  }
  selectIndex.value = index;
  store.changeBlock(index, newBlock);
  mouseDown(e);
}

function containerMouseDown() {
  selectIndex.value = -1;
  clearBlockFocus();
}

let dragState = {
  startX: 0,
  startY: 0,
  startPos: []
};

function mouseMove(e) {
  let { clientX: moveX, clientY: moveY } = e;
  const left = moveX - dragState.startX + dragState.startLeft;
  const top = moveY - dragState.startY + dragState.startTop;

  // 先计算横线 距离参照物元素还有5px的时候，显示
  let y = null,
    x = null;
  for (let i = 0; i < dragState.lines.y.length; i++) {
    const { top: t, showTop: s } = dragState.lines.y[i];
    if (Math.abs(t - top) < 5) {
      // 小于5说明接近了
      y = s; // 线要实现的位置
      moveY = dragState.startY - dragState.startTop + t; // 容器距离顶部的距离 + 目标的高度 就是最新的moveY
      // 实现快速和这个元素贴在一起
      break; // 找到一根线后就跳出循环
    }
  }
  for (let i = 0; i < dragState.lines.x.length; i++) {
    const { left: l, showLeft: s } = dragState.lines.x[i];
    if (Math.abs(l - left) < 5) {
      // 小于5说明接近了
      x = s; // 线要实现的位置
      moveX = dragState.startX - dragState.startLeft + l; // 容器距离顶部的距离 + 目标的高度 就是最新的moveY
      // 实现快速和这个元素贴在一起
      break; // 找到一根线后就跳出循环
    }
  }

  markLine.x = x; // markLine 是一个响应式数据 x, y更新会导致视图更新
  markLine.y = y;

  const durX = moveX - dragState.startX;
  const durY = moveY - dragState.startY;
  store.data.blocks.forEach((block, index) => {
    if (block.focus) {
      const newBlock = { ...block };
      newBlock.top = dragState.startPos[index].top + durY;
      newBlock.left = dragState.startPos[index].left + durX;
      store.changeBlock(index, newBlock);
    }
  });
}

function mouseUp(e) {
  document.removeEventListener('mousemove', mouseMove);
  document.removeEventListener('mouseup', mouseUp);
  markLine.x = null;
  markLine.y = null;
}

function mouseDown(e) {
  const { width: BWidth, height: BHeight } = lastSelectBlock.value;

  dragState = {
    startX: e.clientX,
    startY: e.clientY,
    startLeft: lastSelectBlock.value.left, // b点拖拽前的位置 left 和 top
    startTop: lastSelectBlock.value.top,
    startPos: store.data.blocks.map(({ top, left }) => {
      return {
        top,
        left
      };
    }),
    lines: (() => {
      const { unfocused } = focusData.value; // 获取其他没有选中的以及它们的位置坐辅助线
      const lines = {
        // 计算横线的位置用y来存放 x存放的是纵向
        x: [],
        y: []
      };
      [
        ...unfocused,
        {
          top: 0,
          left: 0,
          width: store.data.container.width,
          height: store.data.container.height
        }
      ].forEach((block) => {
        const {
          top: ATop,
          left: ALeft,
          width: AWidth,
          height: AHeight
        } = block;
        // 此元素拖拽到和A元素top一致的时候，要显示这根辅助线，辅助线的位置就是ATop
        // showTop线的位置 top移动模块位置
        lines.y.push({ showTop: ATop, top: ATop }); // 顶对顶
        lines.y.push({ showTop: ATop, top: ATop - BHeight }); // 顶对底
        lines.y.push({
          showTop: ATop + AHeight / 2,
          top: ATop + AHeight / 2 - BHeight / 2
        }); // 中对中
        lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }); // 底对顶
        lines.y.push({
          showTop: ATop + AHeight,
          top: ATop + AHeight - BHeight
        }); // 底对底

        lines.x.push({ showLeft: ALeft, left: ALeft }); // 左对左
        lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth }); // 右对左
        lines.x.push({
          showLeft: ALeft + AWidth / 2,
          left: ALeft + AWidth / 2 - BWidth / 2
        }); // 中对中
        lines.x.push({
          showLeft: ALeft + AWidth,
          left: ALeft + AWidth - BWidth
        }); // 右对右
        lines.x.push({ showLeft: ALeft, left: ALeft - BWidth }); // 左对右
      });
      return lines;
    })()
  };
  document.addEventListener('mousemove', mouseMove);
  document.addEventListener('mouseup', mouseUp);
}
</script>

<style lang="scss" scoped>
.editor {
  width: 100%;
  height: 100%;
  &-left,
  &-right {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 270px;
    background: skyblue;
  }
  &-left {
    left: 0;
    &-item {
      position: relative;
      width: 250px;
      min-height: 100px;
      margin: 20px auto;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      padding: 20px;
      box-sizing: border-box;
      cursor: move;
      user-select: none;
      .tag {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
        position: absolute;
        left: 0;
        top: 0;
        font-size: 14px;
        background: #ccc;
        color: #fff;
        padding: 4px;
        border-radius: 0 0 2px 0;
      }
      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: #ccc;
        opacity: 0.2;
        z-index: 99;
      }
    }
  }
  &-right {
    right: 0;
  }
  &-top {
    display: flex;
    align-items: center;
    position: absolute;
    left: 280px;
    right: 280px;
    height: 80px;
    background: skyblue;
    z-index: 999;
  }
  &-container {
    padding: 80px 270px 0;
    height: 100%;
    box-sizing: border-box;
    &-canvas {
      overflow: scroll;
      height: 100%;
      &__content {
        position: relative;
        margin: 20px auto;
        background: #ccc;
      }
    }
  }
}

.editor-block {
  position: absolute;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
}

.editor-block--focus {
  &::after {
    border: 1px dashed red;
  }
}

// 移动虚线展示
.line-x {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px dashed red;
}
.line-y {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed red;
}
</style>
