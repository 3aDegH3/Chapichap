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
  image: string | null;
  image_url: string | null;
  is_active: boolean;
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
  search?: string;
};

export async function getCategories() {
  const response = await api.get<Category[]>("/categories/");
  return response.data;
}

export async function getProducts({ page = 1, category, search }: ProductQuery) {
  const response = await api.get<PaginatedResponse<Product>>("/products/", {
    params: {
      page,
      category__slug: category || undefined,
      search: search || undefined,
    },
  });

  return response.data;
}

export async function getProduct(slug: string) {
  const response = await api.get<ProductDetail>(`/products/${slug}/`);
  return response.data;
}
