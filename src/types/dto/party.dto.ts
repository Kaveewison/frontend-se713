export interface CreatePartyDTO {
  name: string;
  logo: string;
  description?: string;
  foundedDate?: string;
}

export interface UpdatePartyDTO {
  name?: string;
  logo?: string;
  description?: string;
}
