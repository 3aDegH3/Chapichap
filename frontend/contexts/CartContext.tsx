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
import { clampProductQuantity, isProductAvailable, type Product } from "@/lib/products-api";

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
  isReady: boolean;
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

function cartItemsFromApi(cart: ApiCart): CartItem[] {
  return cart.items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
  }));
}

function mergeCartItems(serverCart: ApiCart, localItems: CartItem[]) {
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

function hasAllItems(cart: ApiCart, expectedItems: CartItem[]) {
  return expectedItems.every((item) =>
    cart.items.some((cartItem) => cartItem.product.id === item.product.id)
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [pendingServerUpdates, setPendingServerUpdates] = useState(0);
  const itemsRef = useRef<CartItem[]>([]);
  const hasUserMutatedRef = useRef(false);

  const applyApiCart = useCallback((cart: ApiCart) => {
    const nextItems = cartItemsFromApi(cart);
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  const syncLocalItemsWithApi = useCallback(async (localItems: CartItem[]) => {
    const serverCart = await getCart();

    if (localItems.length === 0) {
      if (!hasUserMutatedRef.current) applyApiCart(serverCart);
      return;
    }

    const mergedCartItems = mergeCartItems(serverCart, localItems);
    if (!hasUserMutatedRef.current) {
      itemsRef.current = mergedCartItems;
      setItems(mergedCartItems);
    }

    await Promise.all(
      localItems.map((item) => {
        const serverItem = serverCart.items.find(
          (cartItem) => cartItem.product.id === item.product.id
        );
        const mergedItem = mergedCartItems.find(
          (cartItem) => cartItem.product.id === item.product.id
        );
        const quantity = mergedItem?.quantity || item.quantity;

        return serverItem
          ? updateCartItem(item.product.id, quantity)
          : addToCart(item.product.id, quantity);
      })
    );

    const syncedCart = await getCart();
    if (!hasUserMutatedRef.current && hasAllItems(syncedCart, mergedCartItems)) {
      applyApiCart(syncedCart);
    }
  }, [applyApiCart]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const localItems = readStoredCart();
      itemsRef.current = localItems;
      setItems(localItems);

      void syncLocalItemsWithApi(localItems)
        .catch(() => undefined)
        .finally(() => setIsHydrated(true));
    }, 0);

    return () => window.clearTimeout(timeout);
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
        const price = Number(item.product.effective_price || item.product.price) || 0;
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

  const runServerUpdate = useCallback((operation: Promise<unknown>, fallbackMessage: string) => {
    setPendingServerUpdates((value) => value + 1);

    void operation
      .catch(() => showToast(fallbackMessage))
      .finally(() => setPendingServerUpdates((value) => Math.max(0, value - 1)));
  }, [showToast]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (!isProductAvailable(product)) {
      showToast("این محصول فعلا موجود نیست.");
      return;
    }

    const requestedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
    const currentItems = itemsRef.current;
    const existingItem = currentItems.find((item) => item.product.id === product.id);
    const currentQuantity = existingItem?.quantity || 0;
    const nextQuantity = clampProductQuantity(product, currentQuantity + requestedQuantity);
    const quantityToAdd = nextQuantity - currentQuantity;

    if (quantityToAdd <= 0) {
      showToast("تعداد انتخاب‌شده از موجودی محصول بیشتر است.");
      return;
    }

    const nextItems = existingItem
      ? currentItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQuantity } : item
        )
      : [...currentItems, { product, quantity: nextQuantity }];

    hasUserMutatedRef.current = true;
    itemsRef.current = nextItems;
    setItems(nextItems);

    showToast("محصول به سبد خرید اضافه شد.");
    runServerUpdate(
      addToCart(product.id, quantityToAdd),
      "محصول در همین دستگاه ذخیره شد؛ اتصال سرور برقرار نیست."
    );
  }, [runServerUpdate, showToast]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const currentItems = itemsRef.current;
    const existingItem = currentItems.find((item) => item.product.id === productId);

    if (!existingItem) return;

    const requestedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
    const safeQuantity = clampProductQuantity(existingItem.product, requestedQuantity);

    if (requestedQuantity > safeQuantity) {
      showToast(
        safeQuantity > 0
          ? "حداکثر تعداد قابل سفارش همین موجودی فعلی است."
          : "این محصول فعلا قابل سفارش نیست."
      );
    }

    const nextItems =
      safeQuantity === 0
        ? currentItems.filter((item) => item.product.id !== productId)
        : currentItems.map((item) =>
            item.product.id === productId ? { ...item, quantity: safeQuantity } : item
          );

    hasUserMutatedRef.current = true;
    itemsRef.current = nextItems;
    setItems(nextItems);

    runServerUpdate(
      safeQuantity === 0 ? removeCartItem(productId) : updateCartItem(productId, safeQuantity),
      "تغییر تعداد محلی ذخیره شد؛ اتصال سرور برقرار نیست."
    );
  }, [runServerUpdate, showToast]);

  const removeItem = useCallback((productId: number) => {
    const nextItems = itemsRef.current.filter((item) => item.product.id !== productId);
    hasUserMutatedRef.current = true;
    itemsRef.current = nextItems;
    setItems(nextItems);
    showToast("آیتم از سبد خرید حذف شد.");
    runServerUpdate(
      removeCartItem(productId),
      "حذف در همین دستگاه ذخیره شد؛ اتصال سرور برقرار نیست."
    );
  }, [runServerUpdate, showToast]);

  const clearCart = useCallback(() => {
    const currentItems = itemsRef.current;
    hasUserMutatedRef.current = true;
    itemsRef.current = [];
    setItems([]);
    showToast("سبد خرید خالی شد.");
    runServerUpdate(
      Promise.all(currentItems.map((item) => removeCartItem(item.product.id))),
      "سبد در همین دستگاه خالی شد؛ اتصال سرور برقرار نیست."
    );
  }, [runServerUpdate, showToast]);

  const isReady = isHydrated && pendingServerUpdates === 0;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
      isReady,
      toast,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      dismissToast: () => setToast(null),
    }),
    [
      addItem,
      clearCart,
      isReady,
      items,
      removeItem,
      toast,
      totals.totalItems,
      totals.totalPrice,
      updateQuantity,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-[#D2AD70]/45 bg-[#FAFAF8] px-4 py-3 text-center text-sm font-black text-[#333230] shadow-[0_18px_60px_-30px_rgba(51,50,48,0.65)] sm:left-6 sm:translate-x-0">
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
