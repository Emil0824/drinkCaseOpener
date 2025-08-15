/**
 * Main application entry point
 * Initializes Vue 3 app with router and global styles
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// Create and configure Vue application
const app = createApp(App)

// Install router plugin
app.use(router)

// Mount to DOM
app.mount('#app')