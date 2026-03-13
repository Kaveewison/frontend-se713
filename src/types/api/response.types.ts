/**
 * API Response Types
 *
 * Type definitions for API responses to ensure type-safe handling
 * of server responses throughout the application.
 *
 * @module types/api/response.types
 */

/**
 * Generic API response wrapper
 *
 * @template T - The type of data contained in the response
 * @property data - The response payload
 * @property status - HTTP status code
 * @property message - Response message
 * @property timestamp - Response timestamp
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

/**
 * Paginated response wrapper for list endpoints
 *
 * @template T - The type of items in the data array
 * @property data - Array of items for current page
 * @property meta - Pagination metadata
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Pagination metadata
 *
 * @property page - Current page number (1-indexed)
 * @property pageSize - Number of items per page
 * @property total - Total number of items across all pages
 * @property totalPages - Total number of pages
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Success response for operations that don't return data
 *
 * @property success - Whether the operation succeeded
 * @property message - Success message (typically in Thai)
 * @property data - Optional data payload
 *
 * @template T - The type of data contained in the response (optional)
 */
export interface SuccessResponse<T = void> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Type guard to check if a value is an ApiResponse
 *
 * @template T - The expected type of data in the response
 * @param value - The value to check
 * @returns True if value is an ApiResponse<T>
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/users');
 * const data = await response.json();
 *
 * if (isApiResponse<User>(data)) {
 *   console.log(data.data.name); // Type-safe access
 * }
 * ```
 */
export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    "status" in value &&
    "message" in value
  );
}

/**
 * Type guard to check if a value is a PaginatedResponse
 *
 * @template T - The expected type of items in the data array
 * @param value - The value to check
 * @returns True if value is a PaginatedResponse<T>
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/users?page=1');
 * const data = await response.json();
 *
 * if (isPaginatedResponse<User>(data)) {
 *   console.log(`Page ${data.meta.page} of ${data.meta.totalPages}`);
 *   data.data.forEach(user => console.log(user.name));
 * }
 * ```
 */
export function isPaginatedResponse<T>(
  value: unknown,
): value is PaginatedResponse<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    "meta" in value &&
    Array.isArray((value as any).data)
  );
}
