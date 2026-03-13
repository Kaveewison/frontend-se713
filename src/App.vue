<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import DashboardNavbar from '@/components/DashboardNavbar.vue';
import DashboardSubNav from '@/components/DashboardSubNav.vue';

const route = useRoute();

const isDashboardRoute = computed(() => {
  const authRoutes = ['/', '/login', '/register'];
  return !authRoutes.includes(route.path);
});
</script>

<template>
  <div class="app-container">
    <template v-if="isDashboardRoute">
      <DashboardNavbar />
      <DashboardSubNav />
    </template>

    <!-- Main Content Area -->
    <main :class="{ 'dashboard-content': isDashboardRoute }">
      <router-view v-slot="{ Component }">
        <transition name="page-transition" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-content {
  flex: 1;
  padding: 2rem 4rem;
  margin: 0 auto;
  width: 100%;
  background-color: var(--bg-page);
}

.page-transition-enter-active {
  animation: pageIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.page-transition-leave-active {
  animation: pageOut 0.25s cubic-bezier(0.4, 0, 1, 1) both;
}

@keyframes pageIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pageOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}
</style>
