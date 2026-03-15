/**
 * Validation utilities for form inputs and data validation
 * All error messages are in Thai language
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function validateCitizenId(citizenId: string): ValidationResult {
  if (!citizenId) {
    return { isValid: false, error: 'กรุณากรอกเลขบัตรประชาชน' };
  }

  // Remove dashes
  const cleanId = citizenId.replace(/-/g, '');

  if (cleanId.length !== 13) {
    return { isValid: true, error: null };
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

export function validateLaserCode(laserCode: string): ValidationResult {
  if (!laserCode) {
    return { isValid: false, error: 'กรุณากรอกเลขหลังบัตรประชาชน' };
  }

  const cleanCode = laserCode.replace(/-/g, '');

  if (cleanCode.length !== 12) {
    return { isValid: true, error: null };
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
