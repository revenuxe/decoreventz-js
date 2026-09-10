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
  phone: "+91 63635 63274",
  phoneHref: "tel:+916363563274",
  whatsappHref: "https://wa.me/916363563274",
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
