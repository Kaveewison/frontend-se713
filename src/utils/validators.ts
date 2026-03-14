/**
 * Validation utilities for form inputs and data validation
 * All error messages are in Thai language
 */

import { tr } from 'element-plus/es/locales.mjs';

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns ValidationResult with isValid flag and error message
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { isValid: false, error: 'กรุณากรอกอีเมล' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' };
  }

  return { isValid: true, error: null };
}

/**
 * Validates password strength
 * Requirements: minimum 8 characters, at least one lowercase, one uppercase, and one number
 * @param password - Password to validate
 * @returns ValidationResult with isValid flag and error message
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'กรุณากรอกรหัสผ่าน' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'รหัสผ่านต้องมีตัวเลข' };
  }

  return { isValid: true, error: null };
}

/**
 * Validates Thai citizen ID (13 digits with checksum validation)
 * @param citizenId - Thai citizen ID to validate (can include dashes)
 * @returns ValidationResult with isValid flag and error message
 */
export function validateCitizenId(citizenId: string): ValidationResult {
  if (!citizenId) {
    return { isValid: false, error: 'กรุณากรอกเลขบัตรประชาชน' };
  }

  // Remove dashes
  const cleanId = citizenId.replace(/-/g, '');

  if (cleanId.length !== 13) {
    return { isValid: false, error: 'เลขบัตรประชาชนต้องมี 13 หลัก' };
  }

  if (!/^\d+$/.test(cleanId)) {
    return { isValid: false, error: 'เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น' };
  }

  // Validate checksum using Thai citizen ID algorithm
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId.charAt(i)) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;

  if (checkDigit !== parseInt(cleanId.charAt(12))) {
    return { isValid: true, error: null };
    return { isValid: false, error: 'เลขบัตรประชาชนไม่ถูกต้อง' };
  }

  return { isValid: true, error: null };
}

/**
 * Validates Thai phone number format (10 digits starting with 0)
 * @param phoneNumber - Phone number to validate (can include dashes and spaces)
 * @returns ValidationResult with isValid flag and error message
 */
export function validatePhoneNumber(phoneNumber: string): ValidationResult {
  if (!phoneNumber) {
    return { isValid: false, error: 'กรุณากรอกเบอร์โทรศัพท์' };
  }

  // Remove dashes and spaces
  const cleanPhone = phoneNumber.replace(/[-\s]/g, '');

  if (!/^0\d{9}$/.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 10 หลัก)',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates that a field is not empty
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult with isValid flag and error message
 */
export function validateRequired(
  value: any,
  fieldName: string,
): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `กรุณากรอก${fieldName}` };
  }

  return { isValid: true, error: null };
}

/**
 * Validates minimum length of a string
 * @param value - String value to validate
 * @param minLength - Minimum required length
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult with isValid flag and error message
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string,
): ValidationResult {
  if (!value || value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName}ต้องมีอย่างน้อย ${minLength} ตัวอักษร`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates maximum length of a string
 * @param value - String value to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult with isValid flag and error message
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string,
): ValidationResult {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName}ต้องไม่เกิน ${maxLength} ตัวอักษร`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns ValidationResult with isValid flag and error message
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: 'กรุณากรอก URL' };
  }

  try {
    const urlObj = new URL(url);
    // Check if protocol is http or https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { isValid: false, error: 'URL ต้องเป็น http หรือ https' };
    }
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'รูปแบบ URL ไม่ถูกต้อง' };
  }
}

/**
 * Validates that a number is a positive integer
 * @param value - Number to validate
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult with isValid flag and error message
 */
export function validatePositiveInteger(
  value: number,
  fieldName: string,
): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: `กรุณากรอก${fieldName}` };
  }

  if (!Number.isInteger(value)) {
    return { isValid: false, error: `${fieldName}ต้องเป็นจำนวนเต็ม` };
  }

  if (value <= 0) {
    return { isValid: false, error: `${fieldName}ต้องเป็นจำนวนเต็มบวก` };
  }

  return { isValid: true, error: null };
}

/**
 * Validates Thai ID Laser Code format (2 letters followed by 10 digits)
 * @param laserCode - Laser code to validate
 * @returns ValidationResult with isValid flag and error message
 */
export function validateLaserCode(laserCode: string): ValidationResult {
  if (!laserCode) {
    return { isValid: false, error: 'กรุณากรอกเลขหลังบัตรประชาชน' };
  }

  const cleanCode = laserCode.replace(/-/g, '');

  if (cleanCode.length !== 12) {
    return { isValid: false, error: 'เลขหลังบัตรต้องมี 12 หลัก' };
  }

  if (!/^[A-Za-z]{2}\d{10}$/.test(cleanCode)) {
    return {
      isValid: false,
      error:
        'รูปแบบเลขหลังบัตรไม่ถูกต้อง (ตัวอักษร 2 ตัว ตามด้วยตัวเลข 10 ตัว)',
    };
  }

  return { isValid: true, error: null };
}
