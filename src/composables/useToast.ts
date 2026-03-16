/**
 * Toast Notification Composable
 *
 * Provides a global toast notification system using Element Plus Notification.
 *
 * @module composables/useToast
 *
 * @example
 * ```typescript
 * const { showSuccess, showError } = useToast();
 *
 * showSuccess('บันทึกข้อมูลสำเร็จ');
 * showError('เกิดข้อผิดพลาด', 5000); // Custom duration
 * ```
 */

import { ElNotification } from 'element-plus';

/**
 * Toast type variants
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/** Default duration for toasts (3 seconds) */
const DEFAULT_DURATION = 3000;

/**
 * Toast Notification Composable
 *
 * Provides functions to show different types of toast notifications
 * with automatic dismissal using Element Plus.
 *
 * @returns Toast notification functions
 */
export function useToast() {
  /**
   * Shows a success toast notification
   *
   * @param message - Success message in Thai
   * @param duration - Optional custom duration in milliseconds
   *
   * @example
   * ```typescript
   * showSuccess('บันทึกข้อมูลสำเร็จ');
   * showSuccess('ลบข้อมูลสำเร็จ', 5000);
   * ```
   */
  function showSuccess(message: string, duration = DEFAULT_DURATION): void {
    ElNotification({
      title: 'สำเร็จ',
      message,
      type: 'success',
      duration,
      position: 'top-right',
    });
  }

  /**
   * Shows an error toast notification
   *
   * @param message - Error message in Thai
   * @param duration - Optional custom duration in milliseconds
   *
   * @example
   * ```typescript
   * showError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
   * ```
   */
  function showError(message: string, duration = DEFAULT_DURATION): void {
    if (message && message.includes('ไม่มีสิทธิ์')) return;

    ElNotification({
      title: 'เกิดข้อผิดพลาด',
      message,
      type: 'error',
      duration,
      position: 'top-right',
    });
  }

  /**
   * Shows an info toast notification
   *
   * @param message - Info message in Thai
   * @param duration - Optional custom duration in milliseconds
   *
   * @example
   * ```typescript
   * showInfo('กำลังประมวลผลข้อมูล');
   * ```
   */
  function showInfo(message: string, duration = DEFAULT_DURATION): void {
    ElNotification({
      title: 'ข้อมูล',
      message,
      type: 'info',
      duration,
      position: 'top-right',
    });
  }

  /**
   * Shows a warning toast notification
   *
   * @param message - Warning message in Thai
   * @param duration - Optional custom duration in milliseconds
   *
   * @example
   * ```typescript
   * showWarning('กรุณาตรวจสอบข้อมูลอีกครั้ง');
   * ```
   */
  function showWarning(message: string, duration = DEFAULT_DURATION): void {
    ElNotification({
      title: 'คำเตือน',
      message,
      type: 'warning',
      duration,
      position: 'top-right',
    });
  }

  return {
    /** Show success toast */
    showSuccess,
    /** Show error toast */
    showError,
    /** Show info toast */
    showInfo,
    /** Show warning toast */
    showWarning,
  };
}
