import Link from "next/link";
import type { CSSProperties } from "react";

import type { CartItem } from "@/contexts/CartContext";
import {
  getProductStockLimit,
  isProductAvailable,
} from "@/lib/products-api";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(
    Number(price) || 0,
  );
}

export default function CartItemCard({
  item,
  index,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  index: number;
  onUpdateQuantity: (
    productId: number,
    quantity: number,
  ) => void;
  onRemove: (productId: number, title: string) => void;
}) {
  const unitPrice =
    item.product.effective_price || item.product.price;

  const lineTotal = Number(unitPrice) * item.quantity;
  const stockLimit = getProductStockLimit(item.product);
  const isAvailable = isProductAvailable(item.product);

  const hasQuantityIssue =
    stockLimit !== null && item.quantity > stockLimit;

  const isIncreaseDisabled =
    !isAvailable ||
    (stockLimit !== null &&
      item.quantity >= stockLimit);

  return (
    <article
      className="cart-item-enter group relative overflow-hidden rounded-[30px] border border-[#E3DBD0] bg-white p-4 shadow-[0_24px_60px_-48px_rgba(48,40,32,0.54)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D2AD70]/70 hover:shadow-[0_34px_76px_-50px_rgba(99,68,31,0.42)] sm:p-5"
      style={
        {
          animationDelay: `${index * 90}ms`,
        } as CSSProperties
      }
    >
      <span className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-[#D2AD70]/0 blur-[65px] transition-colors duration-700 group-hover:bg-[#D2AD70]/14" />

      <div className="relative grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
        <Link
          href={`/products/${item.product.slug}`}
          className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[#E3DBD0] bg-[#F6F1E8]"
        >
          {item.product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.product.image_url}
              alt={item.product.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[28px] font-black text-[#A87431]">
              چاپ
            </div>
          )}

          <span className="absolute right-3 top-3 rounded-full border border-white/55 bg-white/85 px-4 py-2 text-[20px] font-black text-[#302B27] backdrop-blur-xl">
            ردیف {(index + 1).toLocaleString("fa-IR")}
          </span>
        </Link>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Link
                href={`/products/${item.product.slug}`}
                className="line-clamp-2 text-[26px] font-black leading-[1.65] text-[#302B27] transition-colors duration-300 hover:text-[#A87431]"
              >
                {item.product.title}
              </Link>

              <p className="mt-2 text-[20px] font-bold text-[#756E66]">
                قیمت واحد:{" "}
                <span className="text-[#302B27]">
                  {formatPrice(unitPrice)} تومان
                </span>
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {item.product.product_type_label && (
                  <span className="inline-flex min-h-[42px] items-center rounded-full border border-[#E3D5BF] bg-[#F6F1E8] px-4 text-[20px] font-black text-[#966429]">
                    {item.product.product_type_label}
                  </span>
                )}

                <span
                  className={[
                    "inline-flex min-h-[42px] items-center rounded-full border px-4 text-[20px] font-black",
                    isAvailable && !hasQuantityIssue
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700",
                  ].join(" ")}
                >
                  {isAvailable
                    ? stockLimit === null
                      ? "موجود"
                      : `موجودی ${stockLimit.toLocaleString(
                          "fa-IR",
                        )}`
                    : "ناموجود"}
                </span>
              </div>

              {hasQuantityIssue && (
                <p className="mt-4 rounded-[17px] border border-red-200 bg-red-50 px-4 py-3 text-[20px] font-bold leading-[1.8] text-red-700">
                  تعداد انتخاب‌شده بیشتر از موجودی فعلی
                  محصول است.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                onRemove(
                  item.product.id,
                  item.product.title,
                )
              }
              className="inline-flex min-h-[50px] shrink-0 items-center justify-center rounded-[16px] border border-red-200 bg-red-50 px-5 text-[20px] font-black text-red-700 transition-all duration-500 hover:-translate-y-1 hover:bg-red-100"
            >
              حذف محصول
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-5 border-t border-[#ECE5DC] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-grid min-h-[58px] w-full max-w-[210px] grid-cols-3 overflow-hidden rounded-[18px] border border-[#DDD5CA] bg-[#FBFAF7]">
              <button
                type="button"
                onClick={() =>
                  onUpdateQuantity(
                    item.product.id,
                    item.quantity + 1,
                  )
                }
                disabled={isIncreaseDisabled}
                className="text-[28px] font-black text-[#A87431] transition-colors duration-300 hover:bg-[#F3E9DA] disabled:cursor-not-allowed disabled:text-[#C9C0B2] disabled:hover:bg-transparent"
                aria-label="افزایش تعداد"
              >
                +
              </button>

              <input
                value={item.quantity}
                inputMode="numeric"
                onChange={(event) =>
                  onUpdateQuantity(
                    item.product.id,
                    Number(event.target.value),
                  )
                }
                disabled={!isAvailable}
                className="min-w-0 border-x border-[#DDD5CA] bg-white text-center text-[22px] font-black text-[#302B27] outline-none"
                aria-label="تعداد محصول"
              />

              <button
                type="button"
                onClick={() =>
                  onUpdateQuantity(
                    item.product.id,
                    item.quantity - 1,
                  )
                }
                className="text-[28px] font-black text-[#756E66] transition-colors duration-300 hover:bg-[#F3E9DA]"
                aria-label="کاهش تعداد"
              >
                −
              </button>
            </div>

            <div className="text-right sm:text-left">
              <p className="text-[20px] font-bold text-[#756E66]">
                جمع این محصول
              </p>
              <p className="mt-1 text-[28px] font-black leading-[1.6] text-[#302B27]">
                {formatPrice(lineTotal)} تومان
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}