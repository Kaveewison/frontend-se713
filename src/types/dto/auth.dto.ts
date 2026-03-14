import type { User } from "../models";

export interface LoginDTO {
  nationalId: string;
  laserCode: string;
}

export interface RegistrationDTO {
  nationalId: string;
  laserCode: string;
  title?: string;
  firstName: string;
  lastName: string;
  address: string;
  province: string;
  districtNumber: number;
}

export interface AuthResponseDTO {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UploadProfileImageResponseDTO {
  success: boolean;
  message: string;
  data: {
    id: number;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
}
