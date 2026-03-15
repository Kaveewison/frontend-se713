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

  getters: {},

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
