// Auth DTOs
export type { LoginDTO, RegistrationDTO, AuthResponseDTO } from "./auth.dto";

// Candidate DTOs
export type { CreateCandidateDTO, UpdateCandidateDTO } from "./candidate.dto";

// Constituency DTOs
export type {
  CreateConstituencyDTO,
  UpdateConstituencyDTO,
} from "./constituency.dto";

// Election DTOs
export type { PartyOverview, PartyOverviewResponse } from "./election.dto";

// Party DTOs
export type { CreatePartyDTO, UpdatePartyDTO } from "./party.dto";

// User DTOs
export type { CreateUserDTO, UpdateUserDTO } from "./user.dto";

// Vote DTOs
export type {
  SubmitVoteDTO,
  BallotResponse,
  BallotCandidate,
  BallotParty,
  BallotConstituency,
  MyVoteResponse,
  MyVoteRecord,
  MyVoteCandidate,
} from "./vote.dto";
