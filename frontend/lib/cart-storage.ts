import type { ApiCart } from "@/lib/cart-api";
import type { Product } from "@/lib/products-api";

export type CartItem = {
  product: Product;
  quantity: number;
};

export const CART_STORAGE_KEY = "chapichap.cart.v1";

export function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    const validItems = new Map<number, CartItem>();

    for (const candidate of parsed) {
      if (!candidate || typeof candidate !== "object") continue;

      const { product, quantity } = candidate as Partial<CartItem>;
      if (!product || typeof product !== "object") continue;
      if (!Number.isInteger(product.id) || product.id <= 0) continue;
      if (typeof product.title !== "string" || typeof product.slug !== "string") continue;
      if (typeof product.price !== "string" || typeof product.effective_price !== "string") continue;

      const safeQuantity = Math.min(
        1_000_000,
        Math.max(1, Math.floor(Number(quantity) || 1)),
      );

      validItems.set(product.id, { product, quantity: safeQuantity });
    }

    return Array.from(validItems.values());
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

export function cartItemsFromApi(cart: ApiCart): CartItem[] {
  return cart.items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
  }));
}

export function mergeCartItems(
  serverCart: ApiCart,
  localItems: CartItem[],
) {
  const mergedItems = new Map<number, CartItem>();

  cartItemsFromApi(serverCart).forEach((item) => {
    mergedItems.set(item.product.id, item);
  });

  localItems.forEach((item) => {
    const serverItem = mergedItems.get(item.product.id);

    mergedItems.set(item.product.id, {
      product: item.product,
      quantity: Math.max(serverItem?.quantity || 0, item.quantity),
    });
  });

  return Array.from(mergedItems.values());
}

export function hasAllItems(
  cart: ApiCart,
  expectedItems: CartItem[],
) {
  return expectedItems.every((item) =>
    cart.items.some(
      (cartItem) => cartItem.product.id === item.product.id,
    ),
  );
}
