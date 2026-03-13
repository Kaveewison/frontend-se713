/**
 * Constituency Data Transfer Objects (DTOs)
 *
 * DTOs for constituency-related API requests and responses
 */

/**
 * DTO for creating a new constituency
 */
export interface CreateConstituencyDTO {
  province: string;
  districtNumber: number | null;
}

/**
 * DTO for updating an existing constituency
 */
export interface UpdateConstituencyDTO {
  province?: string;
  districtNumber?: number | null;
  isClosed?: boolean;
}
