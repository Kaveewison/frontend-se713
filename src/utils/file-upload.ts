/**
 * File Upload Utilities
 * Handles file uploads with authentication
 */

import { httpClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { UploadProfileImageResponseDTO } from "@/types/dto/auth.dto";

/**
 * Upload profile image
 * @param file - Image file to upload
 * @returns Promise with upload response containing updated user data
 */
export async function uploadProfileImage(
  file: File,
): Promise<UploadProfileImageResponseDTO> {
  const formData = new FormData();
  formData.append("image", file);

  return httpClient.post<UploadProfileImageResponseDTO>(
    API_ENDPOINTS.AUTH.UPLOAD_PROFILE_IMAGE,
    formData,
  );
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5,
): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, GIF, WebP)",
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `ขนาดไฟล์ต้องไม่เกิน ${maxSizeMB} MB`,
    };
  }

  return { valid: true };
}

/**
 * Create preview URL for image file
 * @param file - Image file
 * @returns Object URL for preview
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to free memory
 * @param url - Object URL to revoke
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
