"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
  type ApiCart,
} from "@/lib/cart-api";
import type { Product } from "@/lib/products-api";

export type CartItem = {
  product: Product;
  quantity: number;
};

type Toast = {
  id: number;
  message: string;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  toast: Toast | null;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  dismissToast: () => void;
};

const CART_STORAGE_KEY = "chapichap.cart.v1";
const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const itemsRef = useRef<CartItem[]>(items);

  const applyApiCart = useCallback((cart: ApiCart) => {
    setItems(
      cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      }))
    );
  }, []);

  const syncLocalItemsWithApi = useCallback(async (localItems: CartItem[]) => {
    const serverCart = await getCart();

    if (localItems.length === 0) {
      applyApiCart(serverCart);
      return;
    }

    const mergedItems = new Map<number, number>();
    serverCart.items.forEach((item) => {
      mergedItems.set(item.product.id, item.quantity);
    });

    localItems.forEach((item) => {
      const currentQuantity = mergedItems.get(item.product.id) || 0;
      mergedItems.set(item.product.id, Math.max(currentQuantity, item.quantity));
    });

    await Promise.all(
      localItems.map((item) => {
        const serverItem = serverCart.items.find(
          (cartItem) => cartItem.product.id === item.product.id
        );
        const quantity = mergedItems.get(item.product.id) || item.quantity;

        return serverItem
          ? updateCartItem(item.product.id, quantity)
          : addToCart(item.product.id, quantity);
      })
    );

    applyApiCart(await getCart());
  }, [applyApiCart]);

  useEffect(() => {
    void syncLocalItemsWithApi(itemsRef.current).catch(() => undefined);
    setIsHydrated(true);
  }, [syncLocalItemsWithApi]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    itemsRef.current = items;
  }, [isHydrated, items]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const totals = useMemo(() => {
    return items.reduce(
      (result, item) => {
        const price = Number(item.product.price) || 0;
        result.totalItems += item.quantity;
        result.totalPrice += price * item.quantity;
        return result;
      },
      { totalItems: 0, totalPrice: 0 }
    );
  }, [items]);

  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const safeQuantity = Math.max(1, quantity);

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        );
      }

      return [...currentItems, { product, quantity: safeQuantity }];
    });

    showToast("محصول به سبد خرید اضافه شد.");
    void addToCart(product.id, safeQuantity)
      .then(applyApiCart)
      .catch(() => showToast("محصول در همین دستگاه ذخیره شد؛ اتصال سرور برقرار نیست."));
  }, [applyApiCart, showToast]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const safeQuantity = Math.max(0, quantity);

    setItems((currentItems) =>
      safeQuantity === 0
        ? currentItems.filter((item) => item.product.id !== productId)
        : currentItems.map((item) =>
            item.product.id === productId ? { ...item, quantity: safeQuantity } : item
          )
    );

    void updateCartItem(productId, safeQuantity)
      .then(applyApiCart)
      .catch(() => showToast("تغییر تعداد محلی ذخیره شد؛ اتصال سرور برقرار نیست."));
  }, [applyApiCart, showToast]);

  const removeItem = useCallback((productId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
    showToast("آیتم از سبد خرید حذف شد.");
    void removeCartItem(productId)
      .then(applyApiCart)
      .catch(() => showToast("حذف در همین دستگاه ذخیره شد؛ اتصال سرور برقرار نیست."));
  }, [applyApiCart, showToast]);

  const clearCart = useCallback(() => {
    const currentItems = itemsRef.current;
    setItems([]);
    showToast("سبد خرید خالی شد.");
    void Promise.all(currentItems.map((item) => removeCartItem(item.product.id))).catch(() =>
      showToast("سبد در همین دستگاه خالی شد؛ اتصال سرور برقرار نیست.")
    );
  }, [showToast]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
      toast,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      dismissToast: () => setToast(null),
    }),
    [addItem, clearCart, items, removeItem, toast, totals.totalItems, totals.totalPrice, updateQuantity]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-sky-100 bg-white px-4 py-3 text-center text-sm font-black text-[var(--dark)] shadow-[0_18px_60px_-24px_rgba(0,0,0,0.45)] sm:left-6 sm:translate-x-0">
          {toast.message}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
