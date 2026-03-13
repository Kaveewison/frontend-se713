import type { User } from './user.model';
import type { Party } from './party.model';
import type { Constituency } from './constituency.model';

export interface Candidate {
  readonly id: number;
  userId: number;
  partyId: number;
  constituencyId: number;
  candidateNumber: number;
  
  // Populated relations
  user?: User;
  party?: Party;
  constituency?: Constituency;
  
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
