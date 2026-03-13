export interface SubmitVoteDTO {
  candidateId: number;
  voterId: number;
}

export interface BallotConstituency {
  id: number;
  province: string;
  districtNumber: number;
  isClosed: boolean;
}

export interface BallotParty {
  id: number;
  name: string;
  logoUrl: string | null;
}

export interface BallotCandidate {
  id: number;
  candidateNumber: number;
  title: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  policy: string | null;
  party: BallotParty;
}

export interface BallotResponse {
  constituency: BallotConstituency;
  candidates: BallotCandidate[];
}

export interface MyVoteCandidate {
  id: number;
  candidateNumber: number;
  title: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  party: BallotParty;
}

export interface MyVoteRecord {
  id: number;
  timestamp: string;
  candidate: MyVoteCandidate;
}

export interface MyVoteResponse {
  hasVoted: boolean;
  constituency: BallotConstituency;
  vote: MyVoteRecord | null;
}
