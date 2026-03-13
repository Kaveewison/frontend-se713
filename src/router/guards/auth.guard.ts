/**
 * Authentication Guard
 * 
 * Router guard that protects routes requiring authentication and role-based access.
 * 
 * Features:
 * - Validates authentication status before route access
 * - Redirects unauthenticated users to login
 * - Preserves intended route for post-login redirect
 * - Prevents authenticated users from accessing login/register
 * - Enforces role-based access control (ECT users)
 * - Validates token expiration
 * 
 * @module router/guards/auth
 */

import { useAuthStore } from '@/stores/auth.store';
import { tokenManager } from '@/utils/token-manager';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

/**
 * Authentication guard for Vue Router
 * 
 * Validates user authentication and authorization before allowing route access.
 * 
 * @param to - Target route location
 * @param from - Current route location
 * @param next - Navigation guard callback
 * 
 * @example
 * ```typescript
 * // In router/index.ts
 * import { authGuard } from './guards/auth.guard';
 * router.beforeEach(authGuard);
 * ```
 */
export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> {
  const authStore = useAuthStore();
  const token = tokenManager.getAccessToken();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/register'];
  const isPublicRoute = publicRoutes.includes(to.path);

  // If route is public (login/register)
  if (isPublicRoute) {
    // If already authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
      next('/dashboard/profile');
      return;
    }
    next();
    return;
  }

  // Check if token exists and is valid
  if (!token || tokenManager.isTokenExpired(token)) {
    // Store intended route for redirect after login
    next({
      path: '/',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // Verify authentication state
  if (!authStore.isAuthenticated) {
    try {
      await authStore.checkAuth();
    } catch {
      // Authentication failed, redirect to login
      next({
        path: '/',
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  // Check role-based access for ECT-only routes
  const requiresECT = to.meta.requiresECT;
  if (requiresECT && !authStore.isECTUser) {
    // User lacks required ECT role
    next('/unauthorized');
    return;
  }

  // All checks passed, allow navigation
  next();
}
