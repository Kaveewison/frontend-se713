export interface ConstituencyCount {
  candidates: number;
  users: number;
  eligibleVoters: number;
  parties: number;
}

export interface Constituency {
  readonly id: number;
  name?: string;
  number?: number;
  region?: string;
  province?: string;
  districtNumber?: number;
  isClosed?: boolean;
  _count?: ConstituencyCount;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
