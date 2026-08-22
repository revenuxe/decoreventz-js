import type { ServiceCity } from "./types";

// Bangalore-only for now, matching the original service area — see
// src/lib/site.ts's CONTACT.address.
export const cities: ServiceCity[] = [{ slug: "bangalore", name: "Bangalore" }];
