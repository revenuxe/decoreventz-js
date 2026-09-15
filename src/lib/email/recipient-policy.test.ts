import { expect, it } from "vitest";
import { isBookingNotification, BOOKING_NOTIFICATION_EMAIL as email } from "./recipient-policy";
it("permits only booking operations notifications to the exact business inbox",()=>{
 expect(isBookingNotification("booking/123/admin",email,{to:[email]})).toBe(true);
 expect(isBookingNotification("booking/123/admin",null,null)).toBe(true);
 expect(isBookingNotification("booking/123/customer",email,null)).toBe(false);
 expect(isBookingNotification("booking/123/admin","customer@example.com",null)).toBe(false);
 expect(isBookingNotification("booking/123/admin",email,{to:[email,"customer@example.com"]})).toBe(false);
 expect(isBookingNotification("contact/123/admin",email,null)).toBe(false);
 expect(isBookingNotification("vendor/123/admin",email,null)).toBe(false);
});
