import { defineStore } from "pinia";
import { httpClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { validateCitizenId } from "@/utils/validators";
import type { User } from "@/types/models";
import { UserRole } from "@/types/models/user.model";
import type {
  CreateUserDTO,
  UpdateUserDTO,
  UpdateUserResponseDTO,
} from "@/types/dto/user.dto";
import type { SuccessResponse } from "@/types/api";

export interface GetAllUsersParams {
  page?: number;
  pageSize?: number;
  ectStatus?: boolean;
  search?: string;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as User[],
    selectedUser: null as User | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    ectUsers: (state) =>
      state.users.filter((user) => user.role === UserRole.EC),
    regularUsers: (state) =>
      state.users.filter((user) => user.role === UserRole.VOTER),
    userCount: (state) => state.users.length,
    ectUserCount: (state) =>
      state.users.filter((user) => user.role === UserRole.EC).length,
  },

  actions: {
    async fetchUsers(params?: GetAllUsersParams): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const queryParams = new URLSearchParams();

        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }

        if (params?.pageSize) {
          queryParams.append("pageSize", params.pageSize.toString());
        }

        if (params?.ectStatus !== undefined) {
          queryParams.append("ectStatus", params.ectStatus.toString());
        }

        if (params?.search) {
          queryParams.append("search", params.search);
        }

        const url = queryParams.toString()
          ? `${API_ENDPOINTS.USERS.BASE}?${queryParams.toString()}`
          : API_ENDPOINTS.USERS.BASE;

        const response = await httpClient.get<SuccessResponse<User[]>>(url);
        this.users = response.data;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserById(id: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.get<{ data: User; success: boolean }>(
          API_ENDPOINTS.USERS.BY_ID(id),
        );
        this.selectedUser = response.data;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createUser(data: CreateUserDTO): Promise<User> {
      this.isLoading = true;
      this.error = null;

      try {
        // Validate citizen ID before sending request
        const citizenIdValidation = validateCitizenId(data.citizenId);
        if (!citizenIdValidation.isValid) {
          throw new Error(
            citizenIdValidation.error || "เลขบัตรประชาชนไม่ถูกต้อง",
          );
        }

        const newUser = await httpClient.post<User>(
          API_ENDPOINTS.USERS.BASE,
          data,
        );
        this.users.push(newUser);
        return newUser;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการสร้างผู้ใช้";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateUser(id: number, data: UpdateUserDTO): Promise<User> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.put<UpdateUserResponseDTO>(
          API_ENDPOINTS.USERS.BY_ID(id),
          data,
        );

        const updatedUser = response.data;

        const index = this.users.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.users[index] = updatedUser as User;
        }

        if (this.selectedUser?.id === id) {
          this.selectedUser = updatedUser as User;
        }

        return updatedUser as User;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteUser(id: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await httpClient.delete<SuccessResponse>(API_ENDPOINTS.USERS.BY_ID(id));

        this.users = this.users.filter((u) => u.id !== id);

        if (this.selectedUser?.id === id) {
          this.selectedUser = null;
        }
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการลบผู้ใช้";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async promoteUserToEC(id: number): Promise<User> {
      this.isLoading = true;
      this.error = null;

      try {
        const updatedUser = await httpClient.patch<User>(
          API_ENDPOINTS.USERS.PROMOTE_EC(id),
        );

        const index = this.users.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }

        if (this.selectedUser?.id === id) {
          this.selectedUser = updatedUser;
        }

        return updatedUser;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการแต่งตั้งเป็น กกต.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async demoteECToUser(id: number): Promise<User> {
      this.isLoading = true;
      this.error = null;

      try {
        const updatedUser = await httpClient.patch<User>(
          API_ENDPOINTS.USERS.DEMOTE_VOTER(id),
        );

        const index = this.users.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }

        if (this.selectedUser?.id === id) {
          this.selectedUser = updatedUser;
        }

        return updatedUser;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการถอดถอน กกต.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    clearUsers(): void {
      this.users = [];
      this.selectedUser = null;
      this.error = null;
    },
  },
});
