import { defineStore } from "pinia";
import { httpClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { Candidate } from "@/types/models";
import type { AddCandidateDTO, CreateCandidateDTO, UpdateCandidateDTO } from "@/types/dto";
import type { SuccessResponse } from "@/types/api";

export const useCandidateStore = defineStore("candidate", {
  state: () => ({
    candidates: [] as Candidate[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {},

  actions: {
    async fetchCandidates(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const fetchedCandidates = await httpClient.get<Candidate[]>(
          API_ENDPOINTS.CANDIDATES.BASE,
        );
        this.candidates = fetchedCandidates;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้สมัคร";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async addCandidate(data: AddCandidateDTO): Promise<Candidate> {
      this.isLoading = true;
      this.error = null;

      try {
        const newCandidate = await httpClient.post<Candidate>(
          API_ENDPOINTS.ELECTION.ADD_CANDIDATE,
          data,
        );
        this.candidates.push(newCandidate);
        return newCandidate;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการเพิ่มผู้สมัคร";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createCandidate(data: CreateCandidateDTO): Promise<Candidate> {
      this.isLoading = true;
      this.error = null;

      try {
        const newCandidate = await httpClient.post<Candidate>(
          API_ENDPOINTS.CANDIDATES.BASE,
          data,
        );
        this.candidates.push(newCandidate);
        return newCandidate;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการสร้างผู้สมัคร";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateCandidate(
      id: number,
      data: UpdateCandidateDTO,
    ): Promise<Candidate> {
      this.isLoading = true;
      this.error = null;

      try {
        const updatedCandidate = await httpClient.put<Candidate>(
          API_ENDPOINTS.ELECTION.UPDATE_CANDIDATE(id),
          data,
        );

        const index = this.candidates.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.candidates[index] = updatedCandidate;
        }

        return updatedCandidate;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการอัปเดตผู้สมัคร";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCandidate(id: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await httpClient.delete<SuccessResponse>(
          API_ENDPOINTS.ELECTION.DELETE_CANDIDATE(id),
        );

        this.candidates = this.candidates.filter((c) => c.id !== id);
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการลบผู้สมัคร";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },


  },
});
