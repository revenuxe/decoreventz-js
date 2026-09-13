const DEFAULT_SITE_URL = "https://www.decoreventz.com";

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) return DEFAULT_SITE_URL;

  try {
    const url = new URL(configuredUrl);
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

// Environment variables configured as an empty string override a fallback
// supplied with `??`. Validate the value here because metadataBase calls
// `new URL(SITE_URL)` during the production build.
export const SITE_URL = getSiteUrl();

export const SITE_NAME = "Decor Eventz";

export const CONTACT = {
  phone: "+91 73533 73373",
  phoneHref: "tel:+917353373373",
  whatsappHref: "https://wa.me/917353373373",
  email: "decoreventz.com@gmail.com",
  address: {
    line1: "Shop 4, 5th Main, Dr. M. C. Modi Eye Hospital Building",
    line2: "Mahalakshmipuram",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560086",
    country: "IN",
  },
} as const;

export const CONTACT_ADDRESS_FULL = `${CONTACT.address.line1}, ${CONTACT.address.line2}, ${CONTACT.address.city}, ${CONTACT.address.state} ${CONTACT.address.postalCode}`;

export const CONTACT_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACT_ADDRESS_FULL,
)}`;

export const BUSINESS_HOURS = {
  opens: "10:00",
  closes: "19:00",
  display: "Daily \u00b7 10 AM \u2013 7 PM",
} as const;

// Keep these coordinates aligned with the Google Business Profile whenever
// the premises move.
export const BUSINESS_GEO = {
  latitude: 12.9976916,
  longitude: 77.5463858,
} as const;
