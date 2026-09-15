import { z } from "zod";
const selection = z.object({ kind: z.enum(["palette", "custom"]), label: z.string(), colors: z.array(z.string()) });
const cartItem = z.object({
  id: z.string(), productId: z.string().uuid(), categorySlug: z.string(), categoryName: z.string(),
  serviceSlug: z.string(), serviceName: z.string(), image: z.string(),
  unitPrice: z.number().finite().nonnegative(), originalPrice: z.number().finite().nonnegative().optional(),
  quantity: z.number().int().min(1).max(100),
  addOns: z.array(z.object({ id: z.string().uuid(), name: z.string(), price: z.number().finite().nonnegative() })).max(20),
  balloonSelection: selection.optional(), balloonChoice: z.string().optional(),
});
export function parseCart(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0,50).flatMap((item) => {
    const result = cartItem.safeParse(item);
    return result.success ? [result.data] : [];
  });
}
