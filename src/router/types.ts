/**
 * Router Type Declarations
 * 
 * Extends Vue Router's RouteMeta interface to include custom meta fields
 * for authentication and authorization.
 */

import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Whether the route requires authentication
     * @default true for protected routes, false for public routes
     */
    requiresAuth?: boolean;

    /**
     * Whether the route requires ECT (Election Commission of Thailand) user role
     * @default false
     */
    requiresECT?: boolean;

    /**
     * Whether the route uses the dashboard layout
     * @default false
     */
    useDashboardLayout?: boolean;

    /**
     * Menu group identifier for navbar active state detection
     * Used by DashboardNavbar component to determine which menu item should be highlighted
     * @example 'vote' | 'parties' | 'admin' | 'system' | 'profile'
     */
    menuGroup?: 'vote' | 'parties' | 'admin' | 'system' | 'profile';
  }
}
