import { defineStore } from 'pinia';
import { httpClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  PartyOverview,
  PartyOverviewResponse,
  CreatePartyDTO,
  UpdatePartyDTO,
  ElectionResultsData,
  ElectionResultsResponse,
  PartyDetail,
  PartyDetailResponse,
} from '@/types/dto/election.dto';

export const useElectionStore = defineStore('election', {
  state: () => ({
    partyOverview: [] as PartyOverview[],
    electionResults: null as ElectionResultsData | null,
    publicPartyDetail: null as PartyDetail | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {},

  actions: {
    async fetchPartyOverview(params?: {
      id?: number;
      districtNumber?: number;
    }): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.get<PartyOverviewResponse>(
          API_ENDPOINTS.ELECTION.OVERVIEW(params),
        );
        this.partyOverview = response.data;
      } catch (err: any) {
        this.error =
          err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลภาพรวมพรรคการเมือง';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchElectionResults(constituencyId: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.get<ElectionResultsResponse>(
          API_ENDPOINTS.ELECTION.ELECTION_RESULTS(constituencyId),
        );
        this.electionResults = response.data;
      } catch (err: any) {
        this.error =
          err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผลการเลือกตั้ง';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPublicPartyById(id: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.get<PartyDetailResponse>(
          API_ENDPOINTS.ELECTION.PUBLIC_PARTY_BY_ID(id),
        );
        this.publicPartyDetail = response.data;
      } catch (err: any) {
        this.error = err.message || 'ไม่สามารถโหลดข้อมูลพรรคได้';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateParty(
      partyId: number,
      updateData: UpdatePartyDTO,
    ): Promise<PartyOverview> {
      try {
        const response = await httpClient.put<{ data: PartyOverview }>(
          API_ENDPOINTS.ELECTION.UPDATE_PARTY(partyId),
          updateData,
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'เกิดข้อผิดพลาดในการอัปเดตข้อมูลพรรค';
        throw new Error(errorMessage);
      }
    },

    async createParty(createData: CreatePartyDTO): Promise<PartyOverview> {
      try {
        const response = await httpClient.post<{ data: PartyOverview }>(
          API_ENDPOINTS.ELECTION.CREATE_PARTY,
          createData,
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'เกิดข้อผิดพลาดในการสร้างพรรค';
        throw new Error(errorMessage);
      }
    },

    async uploadPartyLogo(partyId: number, image: File): Promise<void> {
      try {
        const formData = new FormData();
        formData.append('image', image);

        await httpClient.post(
          API_ENDPOINTS.ELECTION.UPLOAD_PARTY_LOGO(partyId),
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'เกิดข้อผิดพลาดในการอัปโหลดโลโก้';
        throw new Error(errorMessage);
      }
    },
  },
});
