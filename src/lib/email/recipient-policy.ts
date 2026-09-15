export const BOOKING_NOTIFICATION_EMAIL = "decoreventz.com@gmail.com";
export function isBookingNotification(eventKey: string, recipient: string | null, request: { to: string[] } | null) {
  return /^booking\/.+\/admin$/.test(eventKey)
    && (recipient === null || recipient === BOOKING_NOTIFICATION_EMAIL)
    && (!request || (request.to.length === 1 && request.to[0] === BOOKING_NOTIFICATION_EMAIL));
}
