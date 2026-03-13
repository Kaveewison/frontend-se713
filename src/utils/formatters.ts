/**
 * Utility functions for formatting data for display
 * Handles Thai Buddhist calendar, phone numbers, citizen IDs, and text truncation
 */

/**
 * Formats a date to Thai Buddhist calendar format
 * @param date - Date object, string, or null/undefined
 * @returns Formatted date string (e.g., "15 มกราคม 2567") or empty string if invalid
 * 
 * **Validates: Requirements 21.1**
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '';
    
    // Convert to Thai Buddhist calendar (add 543 years)
    const buddhistYear = d.getFullYear() + 543;
    const month = d.toLocaleDateString('th-TH', { month: 'long' });
    const day = d.getDate();
    
    return `${day} ${month} ${buddhistYear}`;
  } catch {
    return '';
  }
}

/**
 * Formats a date and time to Thai Buddhist calendar format with time
 * @param date - Date object, string, or null/undefined
 * @returns Formatted datetime string (e.g., "15 มกราคม 2567 14:30 น.") or empty string if invalid
 * 
 * **Validates: Requirements 21.2**
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '';
    
    const dateStr = formatDate(d);
    const time = d.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `${dateStr} ${time} น.`;
  } catch {
    return '';
  }
}

/**
 * Formats a number with thousand separators
 * @param num - Number or null/undefined
 * @returns Formatted number string with Thai locale separators or "0" if null/undefined
 * 
 * **Validates: Requirements 21.3**
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  
  return num.toLocaleString('th-TH');
}

/**
 * Formats a Thai phone number to XXX-XXX-XXXX format
 * @param phoneNumber - Phone number string or null/undefined
 * @returns Formatted phone number (e.g., "081-234-5678") or original string if not 10 digits
 * 
 * **Validates: Requirements 21.4**
 */
export function formatPhoneNumber(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '';
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phoneNumber;
}

/**
 * Formats a Thai citizen ID to X-XXXX-XXXXX-XX-X format
 * @param citizenId - Citizen ID string or null/undefined
 * @returns Formatted citizen ID (e.g., "1-2345-67890-12-3") or original string if not 13 digits
 * 
 * **Validates: Requirements 21.5**
 */
export function formatCitizenId(citizenId: string | null | undefined): string {
  if (!citizenId) return '';
  
  const cleaned = citizenId.replace(/\D/g, '');
  
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 12)}-${cleaned.slice(12)}`;
  }
  
  return citizenId;
}

/**
 * Truncates text to a maximum length and adds ellipsis
 * @param text - Text string or null/undefined
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with "..." or original text if shorter than maxLength
 * 
 * **Validates: Requirements 21.6**
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength)}...`;
}
