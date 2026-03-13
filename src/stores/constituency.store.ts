import { defineStore } from 'pinia';
import { httpClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { validatePositiveInteger } from '@/utils/validators';
import type { Constituency } from '@/types/models';
import type { CreateConstituencyDTO, UpdateConstituencyDTO } from '@/types/dto';
import type { SuccessResponse } from '@/types/api';

export const useConstituencyStore = defineStore('constituency', {
  state: () => ({
    constituencies: [] as Constituency[],
    adminUsers: [] as any[],
    selectedConstituency: null as Constituency | null,
    isLoading: false,
    error: null as string | null,
    isAllOpened: false,
  }),

  getters: {
    sortedConstituencies: (state) =>
      [...state.constituencies].sort((a, b) => {
        const numA = a.number || a.districtNumber || 0;
        const numB = b.number || b.districtNumber || 0;
        return numA - numB;
      }),

    constituenciesByRegion: (state) => {
      const grouped: Record<string, Constituency[]> = {};

      state.constituencies.forEach((constituency) => {
        const region = constituency.region || constituency.province || 'อื่นๆ';
        if (!grouped[region]) {
          grouped[region] = [];
        }
        grouped[region].push(constituency);
      });

      return grouped;
    },

    getConstituencyById: (state) => (id: number) =>
      state.constituencies.find((constituency) => constituency.id === id),

    getConstituenciesByRegion: (state) => (region: string) =>
      state.constituencies.filter((c) => {
        const r = c.region || c.province;
        return r === region;
      }),

    constituencyCount: (state) => state.constituencies.length,

    regions: (state) => {
      const uniqueRegions = new Set(
        state.constituencies.map((c) => c.region || c.province || 'อื่นๆ'),
      );
      return Array.from(uniqueRegions).sort((a, b) => a.localeCompare(b, 'th'));
    },

    constituencyStatsMap: (
      state,
    ): Record<number, { eligibleVoters: number; parties: number }> => {
      const map: Record<
        number,
        { eligibleVoters: number; parties: Set<number> }
      > = {};

      state.adminUsers.forEach((user: any) => {
        const cId: number = user.constituencyId;
        if (!cId) return;
        if (!map[cId]) map[cId] = { eligibleVoters: 0, parties: new Set() };

        if (user.role === 'VOTER') {
          map[cId].eligibleVoters += 1;
        }

        if (user.candidateProfile?.party?.id) {
          map[cId].parties.add(user.candidateProfile.party.id);
        }
      });

      const result: Record<
        number,
        { eligibleVoters: number; parties: number }
      > = {};
      for (const [id, stats] of Object.entries(map)) {
        result[Number(id)] = {
          eligibleVoters: stats.eligibleVoters,
          parties: stats.parties.size,
        };
      }
      return result;
    },
  },

  actions: {
    async fetchConstituencies(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.get<any>(
          API_ENDPOINTS.CONSTITUENCIES.BASE,
        );

        this.constituencies = Array.isArray(response)
          ? response
          : response.data || [];

        if (this.constituencies.length > 0) {
          this.isAllOpened = this.constituencies.every((c) => !c.isClosed);
        }
      } catch (err: any) {
        this.error = err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเขตเลือกตั้ง';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAdminConstituencies(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const [constituenciesRes, usersRes] = await Promise.all([
          httpClient.get<any>(API_ENDPOINTS.CONSTITUENCIES.ADMIN_BASE),
          httpClient.get<any>(API_ENDPOINTS.USERS.BASE),
        ]);

        this.constituencies = Array.isArray(constituenciesRes)
          ? constituenciesRes
          : constituenciesRes.data || [];

        this.adminUsers = Array.isArray(usersRes)
          ? usersRes
          : usersRes.data || [];

        if (this.constituencies.length > 0) {
          this.isAllOpened = this.constituencies.every((c) => !c.isClosed);
        }
      } catch (err: any) {
        this.error = err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเขตเลือกตั้ง';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchConstituencyById(id: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.get<any>(
          API_ENDPOINTS.CONSTITUENCIES.BY_ID(id),
        );
        // Handle both response formats
        this.selectedConstituency = response.data || response;
      } catch (err: any) {
        this.error = err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเขตเลือกตั้ง';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createConstituency(
      data: CreateConstituencyDTO,
    ): Promise<Constituency> {
      this.isLoading = true;
      this.error = null;

      try {
        // Validate province is provided
        if (!data.province || data.province.trim() === '') {
          throw new Error('กรุณากรอกชื่อจังหวัด');
        }

        // Validate district number is provided and is a positive integer
        if (data.districtNumber === null || data.districtNumber === undefined) {
          throw new Error('กรุณากรอกหมายเลขเขตเลือกตั้ง');
        }

        const numberValidation = validatePositiveInteger(
          data.districtNumber,
          'หมายเลขเขตเลือกตั้ง',
        );
        if (!numberValidation.isValid) {
          throw new Error(
            numberValidation.error || 'หมายเลขเขตเลือกตั้งต้องเป็นจำนวนเต็มบวก',
          );
        }

        const response = await httpClient.post<any>(
          API_ENDPOINTS.CONSTITUENCIES.CREATE,
          {
            province: data.province,
            districtNumber: data.districtNumber,
          },
        );

        const newConstituency = response.data || response;
        this.constituencies.push(newConstituency);
        return newConstituency;
      } catch (err: any) {
        this.error = err.message || 'เกิดข้อผิดพลาดในการสร้างเขตเลือกตั้ง';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateConstituency(
      id: number,
      data: UpdateConstituencyDTO,
    ): Promise<Constituency> {
      this.isLoading = true;
      this.error = null;

      try {
        // Validate district number if provided
        if (data.districtNumber !== undefined && data.districtNumber !== null) {
          const numberValidation = validatePositiveInteger(
            data.districtNumber,
            'หมายเลขเขตเลือกตั้ง',
          );
          if (!numberValidation.isValid) {
            throw new Error(
              numberValidation.error ||
                'หมายเลขเขตเลือกตั้งต้องเป็นจำนวนเต็มบวก',
            );
          }
        }

        // Store old constituency data to preserve _count
        const oldConstituency = this.constituencies.find((c) => c.id === id);

        const response = await httpClient.put<any>(
          API_ENDPOINTS.CONSTITUENCIES.UPDATE(id),
          data,
        );
        const updatedConstituency = response.data || response;

        // Preserve _count if it exists in old data but not in response
        if (oldConstituency?._count && !updatedConstituency._count) {
          updatedConstituency._count = oldConstituency._count;
        }

        const index = this.constituencies.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.constituencies[index] = updatedConstituency;
        }

        if (this.selectedConstituency?.id === id) {
          this.selectedConstituency = updatedConstituency;
        }

        if (this.constituencies.length > 0) {
          this.isAllOpened = this.constituencies.every((c) => !c.isClosed);
        }

        return updatedConstituency;
      } catch (err: any) {
        this.error = err.message || 'เกิดข้อผิดพลาดในการอัปเดตเขตเลือกตั้ง';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteConstituency(id: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await httpClient.delete<SuccessResponse>(
          API_ENDPOINTS.CONSTITUENCIES.DELETE(id),
        );

        this.constituencies = this.constituencies.filter((c) => c.id !== id);

        if (this.selectedConstituency?.id === id) {
          this.selectedConstituency = null;
        }
      } catch (err: any) {
        this.error = err.message || 'เกิดข้อผิดพลาดในการลบเขตเลือกตั้ง';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    clearConstituencies(): void {
      this.constituencies = [];
      this.selectedConstituency = null;
      this.error = null;
    },

    async toggleConstituencyStatus(id: number): Promise<void> {
      this.error = null;

      try {
        const response = await httpClient.patch<any>(
          API_ENDPOINTS.CONSTITUENCIES.TOGGLE_STATUS(id),
        );
        const updated = response.data || response;

        const index = this.constituencies.findIndex((c) => c.id === id);
        if (index !== -1) {
          const old = this.constituencies[index];
          this.constituencies[index] = {
            ...old,
            isClosed: updated.isClosed,
          };

          // Update isAllOpened
          if (this.constituencies.length > 0) {
            this.isAllOpened = this.constituencies.every((c) => !c.isClosed);
          }
        }
      } catch (err: any) {
        this.error = err.message || 'เกิดข้อผิดพลาดในการสลับสถานะเขตเลือกตั้ง';
        throw err;
      }
    },

    async toggleAllConstituenciesStatus(isClosed: boolean): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await Promise.all(
          this.constituencies.map((c) =>
            this.updateConstituency(c.id, { isClosed }),
          ),
        );
        this.isAllOpened = !isClosed;
      } catch (err: any) {
        this.error = err.message || 'เกิดข้อผิดพลาดในการสลับสถานะเขตเลือกตั้ง';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
