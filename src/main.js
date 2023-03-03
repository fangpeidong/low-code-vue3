import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import 'element-plus/dist/index.css';
import './assets/main.css';

createApp(App).use(createPinia()).mount('#app');
