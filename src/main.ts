import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import 'element-plus/dist/index.css';
import './assets/index.css';
import './style.css';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth.store';

// Create Vue app
const app = createApp(App);

// Create Pinia instance
const pinia = createPinia();

// Global error handler
app.config.errorHandler = (err, _instance, info) => {
  console.error('Global error:', err);
  console.error('Error info:', info);

  // In production, you might want to send errors to a logging service
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service (e.g., Sentry)
  }
};

// Register plugins
app.use(pinia);
app.use(PrimeVue, {
  unstyled: true, // Use unstyled mode - we'll style everything ourselves
  ripple: false,
});
app.use(router);

// Initialize authentication state from stored token
const authStore = useAuthStore();
authStore.initializeAuth();

// Mount app
app.mount('#app');
