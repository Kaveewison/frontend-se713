<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores';
import { useViewport } from '@/composables/useViewport';

const route = useRoute();
const authStore = useAuthStore();
const { isMobile, isTablet } = useViewport();

const showMobileUI = computed(() => isMobile.value || isTablet.value);

const isSystemActive = computed(() => route.path.startsWith('/system'));
const isAdminActive = computed(
  () => route.path.startsWith('/candidates') && authStore.isAdmin,
);

const hasSubNav = computed(
  () => isSystemActive.value || isAdminActive.value,
);
const shouldShowSubNav = computed(() => hasSubNav.value && !showMobileUI.value);
</script>

<template>
  <div v-if="shouldShowSubNav" class="sub-nav">
    <div class="nav-container sub-nav-container">
      <!-- Sub menu for 'ระบบบริหารการเลือกตั้ง' -->
      <template v-if="isAdminActive">
        <router-link
          to="/candidates/party"
          class="sub-menu-item"
          exact-active-class="sub-menu-active"
          >พรรคการเมือง</router-link
        >
        <router-link
          to="/candidates/user"
          class="sub-menu-item"
          exact-active-class="sub-menu-active"
          >เพิ่มผู้ลงสมัคร</router-link
        >
      </template>

      <!-- Sub menu for 'จัดการระบบ' -->
      <template v-if="isSystemActive">
        <router-link
          to="/system/constituencies"
          class="sub-menu-item"
          exact-active-class="sub-menu-active"
          >จัดการเขตเลือกตั้ง</router-link
        >
        <router-link
          to="/system/users"
          class="sub-menu-item"
          exact-active-class="sub-menu-active"
          >จัดการรายชื่อผู้ใช้งาน</router-link
        >
      </template>
    </div>
  </div>
</template>

<style scoped>
.sub-nav {
  background-color: var(--bg-page);
  border-bottom: 1px solid #e2e8f0;
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 4rem;
  margin-top: 10px;
}

.nav-container {
  width: 100%;
  display: flex;
  align-items: center;
}

.sub-nav-container {
  justify-content: flex-start;
  gap: 1rem;
}

.sub-menu-item {
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.sub-menu-item:hover {
  background-color: rgba(89, 71, 236, 0.05);
}

.sub-menu-item.sub-menu-active {
  background-color: rgba(89, 71, 236, 0.1);
  color: var(--primary);
}
</style>
