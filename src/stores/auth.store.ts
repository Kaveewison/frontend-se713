import { defineStore } from "pinia";
import { httpClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { tokenManager } from "@/utils/token-manager";
import {
  validateEmail,
  validatePassword,
  validateCitizenId,
} from "@/utils/validators";
import type { User } from "@/types/models";
import type {
  LoginDTO,
  RegistrationDTO,
  AuthResponseDTO,
} from "@/types/dto/auth.dto";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    currentUser: null as User | null,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
    isAdmin: false,
  }),

  getters: {
    userRole: (state) => state.currentUser?.role,
    userName: (state) =>
      state.currentUser
        ? `${state.currentUser.firstName} ${state.currentUser.lastName}`
        : "",
  },

  actions: {
    async login(credentials: LoginDTO): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const nationalIdValidation = validateCitizenId(credentials.nationalId);

        if (!nationalIdValidation.isValid) {
          throw new Error(
            nationalIdValidation.error || "หมายเลขประจำตัวไม่ถูกต้อง",
          );
        }

        const response = await httpClient.post<AuthResponseDTO>(
          API_ENDPOINTS.AUTH.LOGIN,
          credentials,
        );

        if (!response.success) {
          throw new Error(response.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }

        this.clearAuth();

        // Store token and user
        tokenManager.setToken(response.data.token);
        tokenManager.setUser(response.data.user);

        this.currentUser = response.data.user;
        this.isAuthenticated = true;
        this.isAdmin =
          response.data.user.role === "ADMIN" ||
          response.data.user.role === "EC";
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async register(data: RegistrationDTO): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        // Validate email format
        const emailValidation = validateEmail(data.email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.error || "รูปแบบอีเมลไม่ถูกต้อง");
        }

        // Validate password strength
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.isValid) {
          throw new Error(
            passwordValidation.error || "รหัสผ่านไม่ตรงตามเงื่อนไข",
          );
        }

        await httpClient.post<{ success: boolean; message: string }>(
          API_ENDPOINTS.AUTH.REGISTER,
          data,
        );
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการลงทะเบียน";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async logout(): Promise<void> {
      this.isLoading = true;

      try {
        await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        this.currentUser = null;
        this.isAuthenticated = false;
        tokenManager.clearTokens();
        this.isLoading = false;
      }
    },

    async checkAuth(): Promise<void> {
      const token = tokenManager.getAccessToken();

      if (!token || tokenManager.isTokenExpired(token)) {
        this.clearAuth();
        return;
      }

      this.isLoading = true;

      try {
        const response = await httpClient.get<any>(
          API_ENDPOINTS.AUTH.CURRENT_USER,
        );

        let user = null;
        if (response.data && response.data.id) {
          // Backend returned full user object in data wrapper
          user = response.data;
          tokenManager.setUser(user); // refresh cache
        } else if (response.id) {
          // Backend returned full user object directly
          user = response;
          tokenManager.setUser(user); // refresh cache
        } else if (response.success === true || response.success === "true") {
          // Backend just returned success status, fallback to local cache
          user = tokenManager.getUser();
        }

        if (user) {
          this.currentUser = user;
          this.isAuthenticated = true;
          this.isAdmin = user.role === "ADMIN" || user.role === "EC";
        } else {
          throw new Error("Unable to resolve user data from API or local cache.");
        }
      } catch (err) {
        console.error("[AuthStore] checkAuth failed with error:", err, "Clearing auth state.");
        this.clearAuth();
      } finally {
        this.isLoading = false;
      }
    },

    clearAuth(): void {
      this.currentUser = null;
      this.isAuthenticated = false;
      tokenManager.clearTokens();
    },

    initializeAuth(): void {
      const token = tokenManager.getAccessToken();
      if (token && !tokenManager.isTokenExpired(token)) {
        this.checkAuth();
      }
    },
  },
});
