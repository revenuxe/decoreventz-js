import { expect, it } from "vitest";
import { calendarDate } from "./calendar-date";

it("uses the selected local calendar day without converting midnight to UTC", () => {
  const date = new Date(2026, 8, 16, 0, 0, 0);
  expect(calendarDate(date)).toBe("2026-09-16");
});
