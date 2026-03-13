/**
 * API Types Module
 * 
 * Centralized exports for all API-related types including
 * response wrappers, error types, and type guards.
 * 
 * @module types/api
 */

// Response Types
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
  SuccessResponse,
} from './response.types';

export {
  isApiResponse,
  isPaginatedResponse,
} from './response.types';

// Error Types
export type {
  ApiError,
  ValidationError,
} from './error.types';

export {
  isApiError,
} from './error.types';
