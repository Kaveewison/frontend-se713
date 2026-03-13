/**
 * API Error Types
 * 
 * Type definitions for API errors to ensure consistent error handling
 * throughout the application.
 * 
 * @module types/api/error.types
 */

/**
 * Standardized API error structure
 * 
 * @property code - Error code for programmatic handling
 * @property message - Human-readable error message (typically in Thai)
 * @property details - Optional field-specific validation errors
 * @property timestamp - When the error occurred
 * 
 * @example
 * ```typescript
 * const error: ApiError = {
 *   code: 'VALIDATION_ERROR',
 *   message: 'ข้อมูลไม่ถูกต้อง',
 *   details: {
 *     email: ['รูปแบบอีเมลไม่ถูกต้อง'],
 *     password: ['รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร']
 *   },
 *   timestamp: new Date()
 * };
 * ```
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: Date;
}

/**
 * Field-level validation error
 * 
 * @property field - The name of the field that failed validation
 * @property message - Validation error message (typically in Thai)
 * 
 * @example
 * ```typescript
 * const validationError: ValidationError = {
 *   field: 'email',
 *   message: 'รูปแบบอีเมลไม่ถูกต้อง'
 * };
 * ```
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Type guard to check if a value is an ApiError
 * 
 * @param value - The value to check
 * @returns True if value is an ApiError
 * 
 * @example
 * ```typescript
 * try {
 *   await api.login(credentials);
 * } catch (error) {
 *   if (isApiError(error)) {
 *     console.error(`Error ${error.code}: ${error.message}`);
 *     
 *     if (error.details) {
 *       Object.entries(error.details).forEach(([field, messages]) => {
 *         console.error(`${field}: ${messages.join(', ')}`);
 *       });
 *     }
 *   }
 * }
 * ```
 */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value
  );
}
