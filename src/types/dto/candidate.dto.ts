export interface AddCandidateDTO {
  userId: number;
  candidateNumber: number;
  title?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  policy?: string;
  partyId: number;
  constituencyId: number;
}

export interface CreateCandidateDTO {
  userId: number;
  partyId: number;
  constituencyId: number;
  candidateNumber: number;
  policy?: string;
}

export interface UpdateCandidateDTO {
  partyId?: number;
  constituencyId?: number;
  candidateNumber?: number;
  firstName?: string;
  lastName?: string;
  policy?: string;
}
