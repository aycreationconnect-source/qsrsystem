/**
 * Generates a clean, date+timestamp ID without underscores or special characters.
 * Format: YYYYMMDD + Date.now() (Timestamp in ms)
 * Example: 202609021788342526604
 */
export function generateNumericId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const yyyymmdd = `${year}${month}${day}`;
  const timestampMs = Date.now();

  return `${yyyymmdd}${timestampMs}`;
}
