import { defineStore } from 'pinia';

export const useDataStore = defineStore('dataStore', {
  state: () => ({
    data: {},
    config: {}
  }),
  getters: {
    containerStyles: (state) => {
      return {
        width: state.data.container.width + 'px',
        height: state.data.container.height + 'px'
      };
    }
  },
  actions: {
    setData(data) {
      this.data = data;
    },
    setConfig(config) {
      this.config = config;
    },
    changeBlock(index, block) {
      this.data.blocks[index] = block;
    },
    changeBlocks(blocks) {
      this.data.blocks = blocks;
    }
  }
});
