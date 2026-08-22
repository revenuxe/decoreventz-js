"use client";

import { useEffect, useState } from "react";
import type { ServiceAddOn } from "@/data/types";

export type CartItem = {
  id: string; // `${categorySlug}/${serviceSlug}`
  productId: string;
  categorySlug: string;
  categoryName: string;
  serviceSlug: string;
  serviceName: string;
  image: string;
  unitPrice: number;
  originalPrice?: number;
  quantity: number;
  addOns: ServiceAddOn[];
  /** A fulfilment snapshot of the palette selection made on the product page. */
  balloonSelection?: {
    kind: "palette" | "custom";
    label: string;
    colors: string[];
  };
  /** @deprecated Kept so carts created before the structured snapshot still work. */
  balloonChoice?: string;
};

const KEY = "baraabar_cart_v1";

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

// Cross-tab/cross-component sync — several components (TopBar badge,
// BottomNav badge, cart page) all read this hook independently, so a
// change in one must be reflected in the others without a page reload.
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setReady(true);
    const onChange = () => setItems(readCart());
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const commit = (next: CartItem[]) => {
    setItems(next);
    writeCart(next);
    notify();
  };

  const addItem = (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => {
    const current = readCart();
    const existing = current.find((it) => it.id === item.id);
    if (existing) {
      commit(
        current.map((it) =>
          it.id === item.id
            ? { ...it, quantity: it.quantity + (item.quantity ?? 1) }
            : it,
        ),
      );
    } else {
      commit([...current, { ...item, quantity: item.quantity ?? 1 }]);
    }
  };

  const removeItem = (id: string) =>
    commit(readCart().filter((it) => it.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeItem(id);
    commit(readCart().map((it) => (it.id === id ? { ...it, quantity } : it)));
  };

  const toggleAddOn = (id: string, addOn: ServiceAddOn) => {
    commit(
      readCart().map((it) => {
        if (it.id !== id) return it;
        const has = it.addOns.some((a) => a.id === addOn.id);
        return {
          ...it,
          addOns: has
            ? it.addOns.filter((a) => a.id !== addOn.id)
            : [...it.addOns, addOn],
        };
      }),
    );
  };

  const clear = () => commit([]);

  const subtotal = items.reduce((sum, it) => {
    const addOnsTotal = it.addOns.reduce((s, a) => s + a.price, 0);
    return sum + (it.unitPrice + addOnsTotal) * it.quantity;
  }, 0);
  const itemCount = items.reduce((n, it) => n + it.quantity, 0);

  return {
    items,
    ready,
    addItem,
    removeItem,
    updateQuantity,
    toggleAddOn,
    clear,
    subtotal,
    itemCount,
  };
}
