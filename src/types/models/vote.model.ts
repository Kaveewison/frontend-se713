export enum VoteStatus {
  NOT_VOTED = 'NOT_VOTED',
  VOTED = 'VOTED',
  INVALID = 'INVALID',
}

export interface VoteRecord {
  readonly id: number;
  readonly voterId: number;
  readonly candidateId: number;
  readonly timestamp: Date;
  status: VoteStatus;
}

export interface VoteResult {
  candidateId: number;
  candidateName: string;
  partyName: string;
  voteCount: number;
  percentage: number;
}
