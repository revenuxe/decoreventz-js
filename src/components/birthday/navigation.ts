export const BIRTHDAY_PATH = "/birthday-decoration-bangalore";
export const birthdayNavigation = [
  { label: "Birthday at Home", slug: "birthday-decoration-at-home" },
  { label: "Kids Birthday", slug: "kids-birthday-decoration" },
  { label: "Simple Decoration", slug: "simple-birthday-decoration" },
  { label: "Balloon Decoration", slug: "balloon-decoration" },
  { label: "Premium Decoration", slug: "premium-birthday-decoration" },
  { label: "Room Surprise", slug: "birthday-room-decoration" },
  { label: "Theme Decoration", slug: "birthday-theme-decoration" },
  { label: "1st Birthday", slug: "first-birthday-decoration" },
];
export function birthdayLandingHref(label: string) {
  const page = birthdayNavigation.find((page) => page.label === label);
  return page ? `${BIRTHDAY_PATH}/${page.slug}` : BIRTHDAY_PATH;
}
