<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useViewport } from '@/composables/useViewport';
import { onClickOutside } from '@/composables/useClickOutside';
import { ChevronDown, Menu, X } from 'lucide-vue-next';

const route = useRoute();
const authStore = useAuthStore();

const { isMobile, isTablet } = useViewport();
const showMobileUI = computed(() => isMobile.value || isTablet.value);

const isMobileMenuOpen = ref(false);
const mobileMenuRef = ref<HTMLElement | null>(null);
const hamburgerButtonRef = ref<HTMLElement | null>(null);

// Toggle states for menu groups
const expandedGroups = ref({
  vote: true,
  admin: true,
  system: true,
});

const isMenuActive = (menuGroup: string): boolean => {
  return route.meta.menuGroup === menuGroup;
};

const isAdmin = computed(() => authStore.isAdmin);

const toggleGroup = (group: keyof typeof expandedGroups.value) => {
  expandedGroups.value[group] = !expandedGroups.value[group];
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Body scroll prevention
watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Auto-close on viewport change to desktop
watch(showMobileUI, (isMobileUI) => {
  if (!isMobileUI && isMobileMenuOpen.value) {
    closeMobileMenu();
  }
});

// Click outside handler
onClickOutside(mobileMenuRef, () => {
  if (isMobileMenuOpen.value) {
    closeMobileMenu();
  }
}, [hamburgerButtonRef]);

// Keyboard event handler
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu();
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <header class="top-nav">
    <div class="nav-container">
      <!-- Hamburger Icon (Mobile/Tablet only) -->
      <button
        v-if="showMobileUI"
        ref="hamburgerButtonRef"
        class="hamburger-button"
        :aria-label="isMobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'"
        :aria-expanded="isMobileMenuOpen"
        @click="toggleMobileMenu"
      >
        <X
          v-if="isMobileMenuOpen"
          :size="24"
          :stroke-width="2"
          class="menu-icon"
        />
        <Menu v-else :size="24" :stroke-width="2" class="menu-icon" />
      </button>

      <!-- Mobile Menu Overlay -->
      <Transition name="mobile-menu">
        <nav
          v-if="showMobileUI && isMobileMenuOpen"
          class="mobile-menu"
          role="navigation"
          aria-label="เมนูหลัก"
          @click.self="closeMobileMenu"
        >
          <div class="mobile-menu-content" ref="mobileMenuRef">
            <template v-if="authStore.isAuthenticated">
              <!-- Vote Link -->
              <div class="mobile-menu-group">
                <router-link
                  to="/vote"
                  class="mobile-menu-item mobile-menu-group-title"
                  :class="{ 'router-link-active': isMenuActive('vote') }"
                  @click="closeMobileMenu"
                >
                  ลงคะแนนเสียง/ดูผลคะแนน
                </router-link>
              </div>

              <!-- Parties Link (no toggle) -->
              <div class="mobile-menu-group">
                <router-link
                  to="/"
                  class="mobile-menu-item mobile-menu-group-title"
                  :class="{ 'router-link-active': isMenuActive('parties') }"
                  @click="closeMobileMenu"
                >
                  รายชื่อพรรคการเมือง
                </router-link>
              </div>

              <!-- Admin Menu Group -->
              <template v-if="isAdmin">
                <div class="mobile-menu-group">
                  <button
                    class="mobile-menu-group-title"
                    @click="toggleGroup('admin')"
                    :aria-expanded="expandedGroups.admin"
                  >
                    <span>ระบบบริหารการเลือกตั้ง</span>
                    <ChevronDown
                      :size="16"
                      class="toggle-icon"
                      :class="{ 'is-expanded': expandedGroups.admin }"
                    />
                  </button>
                  <Transition name="submenu">
                    <div v-if="expandedGroups.admin" class="mobile-submenu">
                      <router-link
                        to="/candidates/party"
                        class="mobile-menu-item mobile-menu-sub-item"
                        @click="closeMobileMenu"
                      >
                        พรรคการเมือง
                      </router-link>
                      <router-link
                        to="/candidates/user"
                        class="mobile-menu-item mobile-menu-sub-item"
                        @click="closeMobileMenu"
                      >
                        เพิ่มผู้ลงสมัคร
                      </router-link>
                    </div>
                  </Transition>
                </div>

                <!-- System Menu Group -->
                <div class="mobile-menu-group">
                  <button
                    class="mobile-menu-group-title"
                    @click="toggleGroup('system')"
                    :aria-expanded="expandedGroups.system"
                  >
                    <span>จัดการระบบ</span>
                    <ChevronDown
                      :size="16"
                      class="toggle-icon"
                      :class="{ 'is-expanded': expandedGroups.system }"
                    />
                  </button>
                  <Transition name="submenu">
                    <div v-if="expandedGroups.system" class="mobile-submenu">
                      <router-link
                        to="/system/constituencies"
                        class="mobile-menu-item mobile-menu-sub-item"
                        @click="closeMobileMenu"
                      >
                        จัดการเขตเลือกตั้ง
                      </router-link>
                      <router-link
                        to="/system/users"
                        class="mobile-menu-item mobile-menu-sub-item"
                        @click="closeMobileMenu"
                      >
                        จัดการรายชื่อผู้ใช้งาน
                      </router-link>
                    </div>
                  </Transition>
                </div>
              </template>

              <!-- Profile -->
              <router-link
                to="/profile"
                class="mobile-menu-item"
                :class="{ 'router-link-active': isMenuActive('profile') }"
                @click="closeMobileMenu"
              >
                ข้อมูลผู้ใช้งาน
              </router-link>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="mobile-menu-item"
                @click="closeMobileMenu"
              >
                เข้าใช้งาน
              </router-link>
            </template>
          </div>
        </nav>
      </Transition>

      <nav v-if="!showMobileUI && authStore.isAuthenticated" class="main-menu">
        <router-link
          to="/vote"
          class="menu-item"
          :class="{ 'router-link-active': isMenuActive('vote') }"
          >ลงคะแนนเสียง/ดูผลคะแนน</router-link
        >
        <router-link
          to="/"
          class="menu-item"
          :class="{ 'router-link-active': isMenuActive('parties') }"
          >รายชื่อพรรค</router-link
        >
        <template v-if="isAdmin">
          <router-link
            to="/admin"
            class="menu-item"
            :class="{ 'router-link-active': isMenuActive('admin') }"
            >ระบบบริหารการเลือกตั้ง</router-link
          >
          <router-link
            to="/system"
            class="menu-item"
            :class="{ 'router-link-active': isMenuActive('system') }"
            >จัดการระบบ</router-link
          >
        </template>
        <router-link
          to="/profile"
          class="menu-item"
          :class="{ 'router-link-active': isMenuActive('profile') }"
          >ข้อมูลผู้ใช้งาน</router-link
        >
      </nav>

      <nav
        v-else-if="!showMobileUI && !authStore.isAuthenticated"
        class="main-menu"
      >
        <router-link to="/login" class="menu-item">เข้าใช้งาน</router-link>
      </nav>
    </div>
  </header>
</template>

<
<style scoped>
.top-nav {
  background-color: white;
  border-bottom: 1px solid var(--primary);
  display: flex;
  justify-content: flex-end;
  padding: 0 2rem;
  height: 60px;
}

.nav-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.main-menu {
  display: flex;
  gap: 2rem;
}

.menu-item {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 18px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.menu-item:hover {
  color: var(--primary);
}

.menu-item.router-link-active {
  color: var(--primary);
}

.hamburger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 1001;
}

.hamburger-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.menu-icon {
  color: var(--primary);
  transition: transform 0.2s ease;
}

.hamburger-button:hover .menu-icon {
  transform: scale(1.1);
}

.mobile-menu {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow-y: auto;
}

.mobile-menu-content {
  background-color: white;
  padding: 1rem 0;
  min-height: 100%;
}

.mobile-menu-item {
  display: block;
  padding: 12px 2rem;
  min-height: 44px;
  font-family: var(--font-family);
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 400;
  font-size: 0.95rem;
  transition:
    background-color 0.2s,
    color 0.2s;
  border-left: 3px solid transparent;
}

.mobile-menu-item:hover,
.mobile-menu-item:focus {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary);
}

.mobile-menu-item.router-link-active {
  color: var(--primary);
  border-left-color: var(--primary);
  background-color: rgba(0, 0, 0, 0.02);
}

.mobile-menu-item + .mobile-menu-item {
  margin-top: 8px;
}

.mobile-menu-group {
  margin-bottom: 1rem;
}

.mobile-menu-group-title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 2rem;
  font-family: var(--font-family);
  font-weight: 400;
  font-size: 0.95rem;
  color: var(--text-muted);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
  text-align: left;
  border-left: 3px solid transparent;
}

.mobile-menu-group-title:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary);
}

.mobile-menu-group-title:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.toggle-icon {
  transition: transform 0.2s ease;
  color: var(--primary);
  flex-shrink: 0;
}

.toggle-icon.is-expanded {
  transform: rotate(180deg);
}

.mobile-submenu {
  overflow: hidden;
}

.mobile-menu-sub-item {
  padding-left: 3rem;
  font-size: 0.9rem;
  font-weight: 400;
}

/* Mobile menu transition animations */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-menu-enter-active .mobile-menu-content,
.mobile-menu-leave-active .mobile-menu-content {
  transition: transform 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from .mobile-menu-content {
  transform: translateX(-100%);
}

.mobile-menu-leave-to .mobile-menu-content {
  transform: translateX(-100%);
}

/* Submenu transition animations */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.2s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Desktop menu responsive styles */
@media (max-width: 1023px) {
  .main-menu {
    display: none;
  }
}

/* Focus indicator styles */
.mobile-menu-item:focus-visible,
.menu-item:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
</style>
