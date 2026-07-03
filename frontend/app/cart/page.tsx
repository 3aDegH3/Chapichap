"use client";

import { useMemo } from "react";

import CartEmptyState from "@/components/cart/CartEmptyState";
import CartHero from "@/components/cart/CartHero";
import CartItemCard from "@/components/cart/CartItemCard";
import CartSkeleton from "@/components/cart/CartSkeleton";
import CartSummary from "@/components/cart/CartSummary";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  getProductStockLimit,
  isProductAvailable,
} from "@/lib/products-api";

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    isReady,
    isSyncing,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const { isAuthenticated } = useAuth();

  const checkoutHref = isAuthenticated
    ? "/checkout"
    : "/login?next=/checkout";

  const itemsWithIssues = useMemo(
    () =>
      items.filter((item) => {
        const stockLimit = getProductStockLimit(item.product);

        return (
          !isProductAvailable(item.product) ||
          (stockLimit !== null &&
            item.quantity > stockLimit)
        );
      }),
    [items],
  );

  const canCheckout =
    items.length > 0 && itemsWithIssues.length === 0;

  function handleRemove(productId: number, title: string) {
    const accepted = window.confirm(
      `«${title}» از سبد خرید حذف شود؟`,
    );

    if (accepted) {
      removeItem(productId);
    }
  }

  function handleClearCart() {
    const accepted = window.confirm(
      "همه محصولات از سبد خرید حذف شوند؟",
    );

    if (accepted) {
      clearCart();
    }
  }

  return (
    <main className="cart-page-shell min-h-screen overflow-hidden bg-[#FBFAF7] text-[#302B27]">
      <CartHero
        totalItems={totalItems}
        totalPrice={totalPrice}
        hasItems={items.length > 0}
      />

      <section className="relative mx-auto grid w-full max-w-[1760px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:px-12 lg:py-16">
        <div className="min-w-0">
          {!isReady ? (
            <CartSkeleton />
          ) : items.length === 0 ? (
            <CartEmptyState />
          ) : (
            <div className="space-y-5">
              <div className="cart-enter flex flex-col gap-5 rounded-[28px] border border-[#E2D9CD] bg-white p-5 shadow-[0_24px_60px_-46px_rgba(48,40,32,0.52)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[24px] font-black text-[#302B27]">
                      {totalItems.toLocaleString("fa-IR")} آیتم
                      در سبد خرید
                    </p>

                    {isSyncing && (
                      <span className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[#D2AD70]/40 bg-[#F6F1E8] px-4 text-[20px] font-black text-[#966429]">
                        <span className="cart-sync-dot h-2.5 w-2.5 rounded-full bg-[#B2894C]" />
                        در حال ذخیره
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-[20px] font-medium leading-[1.9] text-[#756E66]">
                    تعداد محصولات را تنظیم کن؛ مبلغ سفارش
                    بلافاصله محاسبه می‌شود.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearCart}
                  className="inline-flex min-h-[54px] items-center justify-center rounded-[17px] border border-red-200 bg-red-50 px-6 text-[20px] font-black text-red-700 transition-all duration-500 hover:-translate-y-1 hover:bg-red-100"
                >
                  خالی‌کردن سبد
                </button>
              </div>

              <div className="grid gap-5">
                {items.map((item, index) => (
                  <CartItemCard
                    key={item.product.id}
                    item={item}
                    index={index}
                    onUpdateQuantity={updateQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <CartSummary
          totalItems={totalItems}
          totalPrice={totalPrice}
          issueCount={itemsWithIssues.length}
          canCheckout={canCheckout}
          checkoutHref={checkoutHref}
          isAuthenticated={isAuthenticated}
          isSyncing={isSyncing}
        />
      </section>

      <style jsx global>{`
        .cart-page-shell {
          isolation: isolate;
        }

        .cart-enter {
          animation: cart-enter-up 780ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .cart-item-enter {
          animation: cart-enter-up 820ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .cart-summary-enter {
          animation: cart-enter-left 900ms 120ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .cart-sync-dot {
          animation: cart-sync-pulse 1.2s ease-in-out
            infinite;
        }

        .cart-shine-button {
          position: relative;
          overflow: hidden;
        }

        .cart-shine-button::after {
          content: "";
          position: absolute;
          inset-y: 0;
          left: -45%;
          width: 28%;
          transform: skewX(-18deg);
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
        }

        .cart-shine-button:hover::after {
          animation: cart-button-shine 850ms ease-out;
        }

        @keyframes cart-enter-up {
          from {
            opacity: 0;
            filter: blur(5px);
            transform: translateY(34px);
          }

          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        @keyframes cart-enter-left {
          from {
            opacity: 0;
            filter: blur(5px);
            transform: translateX(-38px);
          }

          to {
            opacity: 1;
            filter: blur(0);
            transform: translateX(0);
          }
        }

        @keyframes cart-sync-pulse {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.88);
          }

          50% {
            opacity: 1;
            transform: scale(1.12);
          }
        }

        @keyframes cart-button-shine {
          from {
            transform: translateX(0) skewX(-18deg);
          }

          to {
            transform: translateX(620%) skewX(-18deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cart-page-shell *,
          .cart-page-shell *::before,
          .cart-page-shell *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}