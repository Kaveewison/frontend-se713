export interface PartyOverview {
  id: number;
  name: string;
  logoUrl: string;
  policy: string;
  totalElectedMPs: number;
  totalCandidates: number;
}

export interface PartyOverviewResponse {
  success: boolean;
  data: PartyOverview[];
}

export interface CreatePartyDTO {
  name: string;
  logoUrl: string;
  policy: string;
}

export interface UpdatePartyDTO {
  name: string;
  logoUrl: string;
  policy: string;
}

export interface ElectionResultsParty {
  id: number;
  name: string;
  logoUrl: string | null;
}

export interface ElectionResultsCandidate {
  id: number;
  candidateNumber: number;
  title: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  policy: string;
  party: ElectionResultsParty;
  voteCount: number;
}

export interface ElectionResultsConstituency {
  id: number;
  province: string;
  districtNumber: number;
  isClosed: boolean;
}

export interface ElectionResultsData {
  constituency: ElectionResultsConstituency;
  candidates: ElectionResultsCandidate[];
}

export interface ElectionResultsResponse {
  success: boolean;
  data: ElectionResultsData;
}

export interface PartyDetailConstituency {
  id: number;
  province: string;
  districtNumber: number;
  isClosed: boolean;
}

export interface PartyDetailCandidate {
  id: number;
  candidateNumber: number;
  title: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  policy: string;
  constituency: PartyDetailConstituency;
  voteCount: number | null;
  isElected: boolean;
}

export interface PartyDetail {
  id: number;
  name: string;
  logoUrl: string;
  policy: string;
  totalCandidates: number;
  totalElectedMPs: number;
  candidates: PartyDetailCandidate[];
}

export interface PartyDetailResponse {
  success: boolean;
  data: PartyDetail;
}
