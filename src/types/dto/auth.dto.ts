import type { User } from "../models";

export interface LoginDTO {
  nationalId: string;
  laserCode: string;
}

export interface RegistrationDTO {
  citizenId: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  constituencyId: number;
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
