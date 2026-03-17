import type { UserRole } from "../models";

export interface CreateUserDTO {
  citizenId: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  constituencyId: number;
  role?: UserRole;
}

export interface UpdateUserDTO {
  title?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  constituencyId?: number;
  imageUrl?: string;
}

export interface UpdateUserResponseDTO {
  success: boolean;
  message: string;
  data: {
    id: number;
    nationalId: string;
    laserCode: string | null;
    title: string | null;
    firstName: string;
    lastName: string;
    address: string | null;
    imageUrl: string | null;
    role: string;
    constituencyId: number;
    constituency: {
      id: number;
      province: string;
      districtNumber: number;
      isClosed: boolean;
    };
    candidateProfile: any;
  };
}
