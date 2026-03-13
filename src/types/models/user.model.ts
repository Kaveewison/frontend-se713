export enum UserRole {
  VOTER = "VOTER",
  ADMIN = "ADMIN",
  EC = "EC",
}

export interface Constituency {
  id: number;
  province: string;
  districtNumber: number;
  isClosed: boolean;
}

export interface CandidateProfile {
  id: number;
  candidateNumber: number;
  policy: string;
  userId: number;
  partyId: number;
  constituencyId: number;
  party?: {
    id: number;
    name: string;
    logoUrl: string | null;
    policy?: string;
  };
}

export interface User {
  readonly id: number;
  readonly nationalId: string;
  readonly laserCode?: string;
  title?: string | null;
  firstName: string;
  lastName: string;
  address?: string;
  imageUrl?: string | null;
  role: UserRole;
  constituencyId?: number;
  constituency?: Constituency;
  candidateProfile?: CandidateProfile | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
