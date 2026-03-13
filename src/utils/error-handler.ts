// Error Handler
// Transforms API errors into standardized format

import type { AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: Date;
}

const ERROR_MESSAGES: Record<number, string> = {
  400: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
  401: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
  403: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
  404: 'ไม่พบข้อมูลที่ต้องการ',
  409: 'ข้อมูลซ้ำกับที่มีอยู่แล้ว',
  422: 'ข้อมูลไม่ผ่านการตรวจสอบ',
  500: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',
  503: 'ระบบไม่สามารถให้บริการได้ชั่วคราว',
};

export function handleApiError(error: AxiosError): ApiError {
  const apiError: ApiError = {
    code: 'UNKNOWN_ERROR',
    message: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    timestamp: new Date(),
  };

  // Network error
  if (!error.response) {
    apiError.code = 'NETWORK_ERROR';
    apiError.message = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    
    if (import.meta.env.DEV) {
      console.error('[Network Error]', error.message);
    }
    
    return apiError;
  }

  // HTTP error
  const status = error.response.status;
  apiError.code = `HTTP_${status}`;
  apiError.message = ERROR_MESSAGES[status] || ERROR_MESSAGES[500];

  // Extract validation errors if present
  if (error.response.data && typeof error.response.data === 'object') {
    const data = error.response.data as any;
    if (data.message) {
      apiError.message = data.message;
    }
    if (data.errors) {
      apiError.details = data.errors;
    }
  }

  if (import.meta.env.DEV) {
    console.error('[API Error]', {
      status,
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      url: error.config?.url,
    });
  }

  return apiError;
}

export function getFieldErrors(error: ApiError): Record<string, string> {
  if (!error.details) return {};
  
  const fieldErrors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(error.details)) {
    fieldErrors[field] = messages[0] || '';
  }
  
  return fieldErrors;
}
