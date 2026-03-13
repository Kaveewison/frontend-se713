import { defineStore } from "pinia";
import { httpClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { VoteResult } from "@/types/models";
import type { SubmitVoteDTO, BallotResponse, MyVoteResponse } from "@/types/dto";
import type { SuccessResponse } from "@/types/api";

export const useVoteStore = defineStore("vote", {
  state: () => ({
    hasVoted: false,
    myVoteData: null as MyVoteResponse | null,
    voteResults: [] as VoteResult[],
    ballot: null as BallotResponse | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    sortedResults: (state) =>
      [...state.voteResults].sort((a, b) => b.voteCount - a.voteCount),

    winningCandidate(state): VoteResult | null {
      if (state.voteResults.length === 0) return null;
      return this.sortedResults[0];
    },

    totalVotes: (state) =>
      state.voteResults.reduce((sum, result) => sum + result.voteCount, 0),

    candidatesWithVotes: (state) =>
      state.voteResults.filter((result) => result.voteCount > 0).length,
  },

  actions: {
    async submitVote(data: SubmitVoteDTO): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await httpClient.post<SuccessResponse>(
          API_ENDPOINTS.VOTES.SUBMIT,
          data,
        );
        this.hasVoted = true;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการลงคะแนนเสียง";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchVoteResults(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const results = await httpClient.get<VoteResult[]>(
          API_ENDPOINTS.VOTES.RESULTS,
        );
        this.voteResults = results;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผลการลงคะแนน";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchResultsByConstituency(constituencyId: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const results = await httpClient.get<VoteResult[]>(
          API_ENDPOINTS.VOTES.BY_CONSTITUENCY(constituencyId),
        );
        this.voteResults = results;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผลการลงคะแนน";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    resetVoteState(): void {
      this.hasVoted = false;
      this.error = null;
    },

    clearVotes(): void {
      this.hasVoted = false;
      this.voteResults = [];
      this.error = null;
    },

    async getBallot(): Promise<BallotResponse> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.get<SuccessResponse<BallotResponse>>(
          API_ENDPOINTS.VOTES.BALLOT,
        );
        this.ballot = response.data;
        return response.data;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลบัตรเลือกตั้ง";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async getMyVote(): Promise<MyVoteResponse> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.get<SuccessResponse<MyVoteResponse>>(
          API_ENDPOINTS.VOTES.MY_VOTE,
        );
        this.myVoteData = response.data;
        this.hasVoted = response.data.hasVoted;
        return response.data;
      } catch (err: any) {
        this.error = err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลการลงคะแนน";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
