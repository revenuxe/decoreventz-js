import type { Json } from "@/lib/supabase/types";

export type BalloonSelectionSnapshot = {
  kind: "palette" | "custom";
  label: string;
  colors: string[];
};

export type BookingCustomizationDetails = {
  balloon?: BalloonSelectionSnapshot;
};

function isRecord(
  value: Json | undefined,
): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Read current structured snapshots and legacy `balloon_choice` records. */
export function getBookingCustomizationDetails(
  value: Json,
): BookingCustomizationDetails {
  if (!isRecord(value)) return {};

  const legacyChoice =
    typeof value.balloon_choice === "string" ? value.balloon_choice.trim() : "";
  const rawBalloon = value.balloon;
  if (
    isRecord(rawBalloon) &&
    typeof rawBalloon.label === "string" &&
    rawBalloon.label.trim()
  ) {
    const colors = Array.isArray(rawBalloon.colors)
      ? rawBalloon.colors.filter(
          (color): color is string =>
            typeof color === "string" && color.trim().length > 0,
        )
      : [];
    return {
      balloon: {
        kind: rawBalloon.kind === "custom" ? "custom" : "palette",
        label: rawBalloon.label.trim(),
        colors,
      },
    };
  }

  return legacyChoice
    ? { balloon: { kind: "palette", label: legacyChoice, colors: [] } }
    : {};
}
