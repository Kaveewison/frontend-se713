import { createRouter, createWebHistory } from 'vue-router';
// import { authGuard } from './guards/auth.guard';
import './types'; // Import route meta type declarations

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/parties/public',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../features/auth/views/LoginView.vue'),
      meta: {
        requiresAuth: false,
        useDashboardLayout: false,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../features/auth/views/RegistrationView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../features/profile/views/UserProfileView.vue'),
      meta: {
        requiresAuth: false,
        useDashboardLayout: true,
        menuGroup: 'profile',
      },
    },
    {
      path: '/system',
      redirect: '/system/constituencies',
      children: [
        {
          path: 'constituencies',
          name: 'system-constituencies',
          component: () =>
            import('../features/constituencies/views/ManageConstituenciesView.vue'),
          meta: {
            requiresAuth: false,
            requiresECT: true,
            useDashboardLayout: true,
            menuGroup: 'system',
          },
        },
        {
          path: 'users',
          name: 'system-users',
          component: () =>
            import('../features/users/views/ManageUsersView.vue'),
          meta: {
            requiresAuth: false,
            requiresECT: true,
            useDashboardLayout: true,
            menuGroup: 'system',
          },
        },
      ],
    },
    {
      path: '/parties',
      redirect: '/parties/public',
      children: [
        {
          path: 'public',
          name: 'parties-public',
          component: () =>
            import('../features/parties/views/PublicPartiesView.vue'),
          meta: {
            requiresAuth: false,
            useDashboardLayout: true,
            menuGroup: 'parties',
          },
        },
        {
          path: 'public/:id',
          name: 'parties-members',
          component: () =>
            import('../features/parties/views/PublicPartyMembersView.vue'),
          meta: {
            requiresAuth: false,
            useDashboardLayout: true,
            menuGroup: 'parties',
          },
        },
        {
          path: ':id/members',
          name: 'admin-party-members',
          component: () =>
            import('../features/parties/views/AdminPartyMembersView.vue'),
          meta: {
            requiresAuth: false,
            requiresECT: true,
            useDashboardLayout: true,
            menuGroup: 'admin',
          },
        },
      ],
    },
    {
      path: '/candidates',
      redirect: '/candidates/party',
      children: [
        {
          path: 'party',
          name: 'setup-parties',
          component: () =>
            import('../features/candidates/views/SetupPartiesView.vue'),
          meta: {
            requiresAuth: false,
            requiresECT: true,
            useDashboardLayout: true,
            menuGroup: 'admin',
          },
        },
        {
          path: 'user',
          name: 'setup-candidates',
          component: () =>
            import('../features/candidates/views/SetupCandidatesView.vue'),
          meta: {
            requiresAuth: false,
            requiresECT: true,
            useDashboardLayout: true,
            menuGroup: 'admin',
          },
        },
      ],
    },
    {
      path: '/vote',
      name: 'vote',
      component: () => import('../features/voting/views/VotePage.vue'),
      meta: {
        requiresAuth: false,
        useDashboardLayout: true,
        menuGroup: 'vote',
      },
    },
    {
      path: '/admin',
      redirect: '/candidates/party',
    },
  ],
});

// Add auth guard to router
// router.beforeEach(authGuard); // Temporarily disabled for development

export default router;
