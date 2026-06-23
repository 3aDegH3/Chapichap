import { api } from "@/lib/api";

export type CheckoutDeliveryMethod = "SHIPPING" | "PICKUP";

export type CheckoutPreviewItem = {
  product_id: number;
  title: string;
  slug: string;
  image_url: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type CheckoutPreview = {
  items: CheckoutPreviewItem[];
  subtotal: string;
  shipping_cost: string;
  total_amount: string;
  delivery_method: CheckoutDeliveryMethod;
  delivery_method_title: string;
  total_quantity: number;
};

export type CheckoutCartItemPayload = {
  product_id: number;
  quantity: number;
};

export type CreateOrderPayload = {
  address_id?: number | null;
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  delivery_method: CheckoutDeliveryMethod;
  save_address?: boolean;
  address_title?: string;
  coupon_code?: string;
  notes?: string;
  items?: CheckoutCartItemPayload[];
};

export type OrderItem = {
  id: number;
  product: number | null;
  product_title: string;
  product_image: string;
  product_image_url: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
  selected_options: Record<string, unknown>;
  created_at: string;
};

export type Order = {
  id: number;
  order_number: string;
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  delivery_method: CheckoutDeliveryMethod;
  delivery_method_label: string;
  shipping_cost: string;
  subtotal: string;
  discount_amount: string;
  coupon_code: string;
  total_amount: string;
  status: string;
  status_label: string;
  notes: string;
  status_history: OrderStatusHistory[];
  payment: {
    id: number;
    amount: string;
    method: string;
    method_label: string;
    status: string;
    status_label: string;
    provider: string;
    paid_at: string | null;
    created_at: string;
  } | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type OrderStatusHistory = {
  id: number;
  previous_status: string;
  new_status: string;
  status_label: string;
  title: string;
  description: string;
  visible_to_customer: boolean;
  created_at: string;
};

export async function getCheckoutPreview(
  deliveryMethod: CheckoutDeliveryMethod = "SHIPPING",
  items: CheckoutCartItemPayload[] = []
) {
  const response = await api.post<CheckoutPreview>("/checkout/preview/", {
    delivery_method: deliveryMethod,
    items,
  });

  return response.data;
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await api.post<Order>("/orders/", payload);
  return response.data;
}

export async function getOrders() {
  const response = await api.get<Order[]>("/orders/");
  return response.data;
}

export async function getOrder(id: number | string) {
  const response = await api.get<Order>(`/orders/${id}/`);
  return response.data;
}
