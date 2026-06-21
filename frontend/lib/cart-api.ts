import { api } from "@/lib/api";
import type { Product } from "@/lib/products-api";

export type ApiCartItem = {
  id: number;
  product: Product;
  quantity: number;
  line_total: string;
};

export type ApiCart = {
  id: number;
  items: ApiCartItem[];
  total_price: string;
  total_quantity: number;
  updated_at: string;
};

export async function getCart() {
  const response = await api.get<ApiCart>("/cart/");
  return response.data;
}

export async function addToCart(productId: number, quantity = 1) {
  const response = await api.post<ApiCart>("/cart/add/", {
    product_id: productId,
    quantity,
  });
  return response.data;
}

export async function updateCartItem(productId: number, quantity: number) {
  const response = await api.post<ApiCart>("/cart/update/", {
    product_id: productId,
    quantity,
  });
  return response.data;
}

export async function removeCartItem(productId: number) {
  const response = await api.post<ApiCart>("/cart/remove/", {
    product_id: productId,
  });
  return response.data;
}
