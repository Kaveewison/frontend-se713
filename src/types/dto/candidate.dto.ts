export interface CreateCandidateDTO {
  userId: number;
  partyId: number;
  constituencyId: number;
  candidateNumber: number;
}

export interface UpdateCandidateDTO {
  partyId?: number;
  constituencyId?: number;
  candidateNumber?: number;
}
