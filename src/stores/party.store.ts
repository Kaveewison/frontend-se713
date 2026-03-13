import { defineStore } from "pinia";
import { httpClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { validateUrl } from "@/utils/validators";
import type { Party, User } from "@/types/models";
import type { CreatePartyDTO, UpdatePartyDTO } from "@/types/dto/party.dto";
import type { SuccessResponse } from "@/types/api";

export const usePartyStore = defineStore("party", {
  state: () => ({
    parties: [] as Party[],
    selectedParty: null as Party | null,
    partyMembers: [] as User[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    sortedParties: (state) =>
      [...state.parties].sort((a, b) => a.name.localeCompare(b.name, "th")),

    getPartyById: (state) => (id: number) =>
      state.parties.find((party) => party.id === id),

    partyCount: (state) => state.parties.length,

    memberCount: (state) => state.partyMembers.length,
  },

  actions: {
    async fetchParties(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const fetchedParties = await httpClient.get<Party[]>(
          API_ENDPOINTS.PARTIES.BASE,
        );
        this.parties = fetchedParties;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลพรรคการเมือง";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPartyById(id: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const party = await httpClient.get<Party>(
          API_ENDPOINTS.PARTIES.BY_ID(id),
        );
        this.selectedParty = party;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลพรรคการเมือง";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createParty(data: CreatePartyDTO): Promise<Party> {
      this.isLoading = true;
      this.error = null;

      try {
        // Validate logo URL format before sending request
        const urlValidation = validateUrl(data.logo);
        if (!urlValidation.isValid) {
          throw new Error(urlValidation.error || "URL โลโก้ไม่ถูกต้อง");
        }

        const newParty = await httpClient.post<Party>(
          API_ENDPOINTS.PARTIES.BASE,
          data,
        );
        this.parties.push(newParty);
        return newParty;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการสร้างพรรคการเมือง";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateParty(id: number, data: UpdatePartyDTO): Promise<Party> {
      this.isLoading = true;
      this.error = null;

      try {
        // Validate logo URL format if provided
        if (data.logo) {
          const urlValidation = validateUrl(data.logo);
          if (!urlValidation.isValid) {
            throw new Error(urlValidation.error || "URL โลโก้ไม่ถูกต้อง");
          }
        }

        const updatedParty = await httpClient.put<Party>(
          API_ENDPOINTS.PARTIES.BY_ID(id),
          data,
        );

        const index = this.parties.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.parties[index] = updatedParty;
        }

        if (this.selectedParty?.id === id) {
          this.selectedParty = updatedParty;
        }

        return updatedParty;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการอัปเดตพรรคการเมือง";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteParty(id: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await httpClient.delete<SuccessResponse>(
          API_ENDPOINTS.PARTIES.BY_ID(id),
        );

        this.parties = this.parties.filter((p) => p.id !== id);

        if (this.selectedParty?.id === id) {
          this.selectedParty = null;
          this.partyMembers = [];
        }
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการลบพรรคการเมือง";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPartyMembers(partyId: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const members = await httpClient.get<User[]>(
          API_ENDPOINTS.PARTIES.MEMBERS(partyId),
        );
        this.partyMembers = members;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิกพรรค";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async addMember(partyId: number, userId: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await httpClient.post<SuccessResponse>(
          API_ENDPOINTS.PARTIES.ADD_MEMBER(partyId, userId),
        );

        await this.fetchPartyMembers(partyId);
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการเพิ่มสมาชิกพรรค";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async removeMember(partyId: number, userId: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await httpClient.delete<SuccessResponse>(
          API_ENDPOINTS.PARTIES.REMOVE_MEMBER(partyId, userId),
        );

        this.partyMembers = this.partyMembers.filter((m) => m.id !== userId);
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการลบสมาชิกพรรค";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    clearParties(): void {
      this.parties = [];
      this.selectedParty = null;
      this.partyMembers = [];
      this.error = null;
    },
  },
});
