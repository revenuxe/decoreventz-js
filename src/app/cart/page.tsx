import type { Metadata } from "next";
import { CartView } from "./cart-view";

// User-specific, empty by default, no organic search value — keep it out
// of the index (see robots.ts, which also disallows crawling it).
export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
