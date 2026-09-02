/**
 * Generates a clean numeric ID combining current date (YYYYMMDD) and millisecond timestamp.
 * Format: 202609021788351359682 (No underscores or special characters)
 */
export function generateNumericId(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  const timestamp = Date.now();
  return `${datePrefix}${timestamp}`;
}
