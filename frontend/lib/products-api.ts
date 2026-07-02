import { api } from "@/lib/api";

export type Category = {
  id: number;
  title: string;
  slug: string;
  description: string;
};

export type Product = {
  id: number;
  category: Category | null;
  title: string;
  slug: string;
  short_description: string;
  description: string | null;
  price: string;
  discount_price: string | null;
  discount_starts_at: string | null;
  discount_ends_at: string | null;
  effective_price: string;
  has_active_discount: boolean;
  product_type: string;
  product_type_label: string;
  gift_usage: string;
  gift_usage_label: string;
  material: string;
  dimensions: string;
  size_guide: string;
  preparation_time: string;
  print_file_guide: string;
  stock_quantity: number;
  unlimited_stock: boolean;
  low_stock_threshold: number;
  is_available: boolean;
  is_low_stock: boolean;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  average_rating: string;
  approved_reviews_count: number;
  created_at: string;
};

export type ProductImage = {
  id: number;
  image: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
};

export type ProductDetail = Product & {
  images: ProductImage[];
  related_products: Product[];
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type ProductQuery = {
  page?: number;
  category?: string;
  productType?: string;
  giftUsage?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  ordering?: string;
};

export const productSortOptions = [
  { value: "-created_at", label: "جدیدترین" },
  { value: "price", label: "ارزان‌ترین" },
  { value: "-price", label: "گران‌ترین" },
  { value: "title", label: "عنوان A تا Z" },
] as const;

export const productTypeOptions = [
  { value: "mug", label: "ماگ" },
  { value: "apparel", label: "پوشاک" },
  { value: "frame", label: "تابلو و قاب" },
  { value: "stationery", label: "نوشت‌افزار" },
  { value: "gift_set", label: "ست هدیه" },
  { value: "promotional", label: "تبلیغاتی" },
  { value: "other", label: "سایر" },
] as const;

export const giftUsageOptions = [
  { value: "personal", label: "هدیه شخصی" },
  { value: "romantic", label: "عاشقانه" },
  { value: "corporate", label: "سازمانی" },
  { value: "birthday", label: "تولد" },
  { value: "event", label: "رویداد" },
  { value: "daily", label: "استفاده روزمره" },
] as const;

export function getProductStockLimit(product: Partial<Pick<Product, "stock_quantity" | "unlimited_stock">>) {
  if (product.unlimited_stock) return null;
  const stock = Number(product.stock_quantity);
  return Number.isFinite(stock) ? Math.max(0, stock) : null;
}

export function isProductAvailable(
  product: Partial<Pick<Product, "is_available" | "stock_quantity">>
) {
  const stockLimit = getProductStockLimit(product);
  return product.is_available !== false && (stockLimit === null || stockLimit > 0);
}

export function clampProductQuantity(
  product: Partial<Pick<Product, "is_available" | "stock_quantity">>,
  quantity: number
) {
  const safeQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
  if (!isProductAvailable(product)) return 0;

  const stockLimit = getProductStockLimit(product);
  return stockLimit === null ? safeQuantity : Math.min(safeQuantity, stockLimit);
}

export async function getCategories() {
  const response = await api.get<Category[]>("/categories/");
  return response.data;
}

export async function getProducts({
  page = 1,
  category,
  productType,
  giftUsage,
  search,
  minPrice,
  maxPrice,
  ordering,
}: ProductQuery) {
  const response = await api.get<PaginatedResponse<Product>>("/products/", {
    params: {
      page,
      category__slug: category || undefined,
      product_type: productType || undefined,
      gift_usage: giftUsage || undefined,
      q: search || undefined,
      price__gte: minPrice || undefined,
      price__lte: maxPrice || undefined,
      ordering: ordering || undefined,
    },
  });

  return response.data;
}

export async function getProduct(slug: string) {
  const response = await api.get<ProductDetail>(`/products/${slug}/`);
  return response.data;
}
