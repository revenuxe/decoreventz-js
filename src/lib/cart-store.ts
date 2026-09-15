"use client";

import { useMemo } from "react";
import { readStorage, writeStorage, useStoredValue, useBrowserReady } from "./browser-storage";
import { parseCart } from "./cart-validation";
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
    const raw = readStorage(KEY);
    return raw ? parseCart(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function useCart() {
  const raw = useStoredValue(KEY);
  const ready = useBrowserReady();
  const items = useMemo(() => {
    try { return raw ? parseCart(JSON.parse(raw)) : []; } catch { return []; }
  }, [raw]);
  const commit = (next: CartItem[]) => writeStorage(KEY,JSON.stringify(next));

  const addItem = (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => {
    const current = readCart();
    const existing = current.find((it) => it.id === item.id);
    if (existing) {
      commit(
        current.map((it) =>
          it.id === item.id
            ? { ...it, quantity: Math.min(100, it.quantity + (item.quantity ?? 1)) }
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
    if (!Number.isInteger(quantity) || quantity > 100) return;
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
