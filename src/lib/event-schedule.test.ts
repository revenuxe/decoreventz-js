import { describe, expect, it } from "vitest";
import { eventToday, eventDayOffset, validEventDate } from "./event-schedule";

describe("event dates", () => {
  it("uses the India date even when UTC is still the previous day", () => {
    expect(eventToday(new Date("2026-09-16T20:00:00Z"))).toBe("2026-09-17");
    expect(validEventDate("2026-09-17", new Date("2026-09-16T20:00:00Z"))).toBe(false);
    expect(validEventDate("2026-09-18", new Date("2026-09-16T20:00:00Z"))).toBe(true);
  });
  it("rejects invalid dates and handles month and year boundaries", () => {
    expect(validEventDate("2099-02-31")).toBe(false);
    expect(validEventDate("garbage")).toBe(false);
    expect(eventDayOffset("2026-12-31", 1)).toBe("2027-01-01");
  });
});
