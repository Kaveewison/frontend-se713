// Utility Functions
// This file exports all utility functions

export { tokenManager } from "./token-manager";
export { handleApiError, getFieldErrors } from "./error-handler";
export type { ApiError } from "./error-handler";
export {
  validateEmail,
  validatePassword,
  validateCitizenId,
  validatePhoneNumber,
  validateRequired,
  validateMinLength,
  validateMaxLength,
} from "./validators";
export type { ValidationResult } from "./validators";
export {
  formatDate,
  formatDateTime,
  formatNumber,
  formatPhoneNumber,
  formatCitizenId,
  truncateText,
} from "./formatters";
export {
  uploadProfileImage,
  validateImageFile,
  createImagePreview,
  revokeImagePreview,
} from "./file-upload";
