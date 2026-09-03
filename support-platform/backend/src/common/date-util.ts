/**
 * Computes the remaining calendar days between the current date and an expiration date.
 * Normalizes to calendar midnight so that:
 * - On the day of registration (Day 0): durationDays remaining (e.g. 90)
 * - On the next calendar day (Day 1): durationDays - 1 remaining (e.g. 89)
 * - On the expiry date (Last day): 0 days remaining (Expires today)
 * - After expiry date: < 0 days (Expired)
 */
export function calculateDaysRemaining(
  expiresAt: Date | string,
  fromDate: Date | string = new Date(),
): number {
  const expiry = new Date(expiresAt);
  const current = new Date(fromDate);

  const expiryMidnight = new Date(
    expiry.getFullYear(),
    expiry.getMonth(),
    expiry.getDate(),
  ).getTime();

  const currentMidnight = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
  ).getTime();

  return Math.round((expiryMidnight - currentMidnight) / (1000 * 60 * 60 * 24));
}
