import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import type { Order } from "@/lib/checkout-api";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
};

export type DashboardData = {
  user: AuthUser;
  profile_completion: number;
  active_orders_count: number;
  design_requests_count: number;
  open_tickets_count: number;
  unread_notifications_count: number;
  latest_order: Order | null;
  latest_design_request: {
    id: number;
    order_type_label: string;
    status_label: string;
    created_at: string;
  } | null;
  active_offer: CustomerOffer | null;
};

export type CustomerAddress = {
  id: number;
  title: string;
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  plaque: string;
  unit: string;
  notes: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type AddressPayload = Omit<CustomerAddress, "id" | "created_at" | "updated_at">;

export type CustomerOffer = {
  id: number;
  title: string;
  description: string;
  offer_type: string;
  offer_type_label: string;
  discount_type: string;
  discount_type_label: string;
  discount_value: string;
  coupon_code: string;
  starts_at: string;
  expires_at: string | null;
  usage_limit: number;
  usage_count: number;
  minimum_order_amount: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  status: "active" | "used" | "expired";
  created_at: string;
};

export type ValidatedOffer = {
  offer: CustomerOffer;
  discount_amount: string;
  final_amount: string;
};

export type SupportAttachment = {
  id: number;
  file: string;
  file_url: string;
  filename: string;
  file_size: number;
  mime_type: string;
};

export type SupportMessage = {
  id: number;
  sender: number | null;
  sender_name: string;
  message: string;
  is_staff_message: boolean;
  is_read_by_customer: boolean;
  attachments: SupportAttachment[];
  created_at: string;
};

export type SupportTicket = {
  id: number;
  order: number | null;
  order_number: string;
  subject: string;
  category: string;
  category_label: string;
  priority: string;
  priority_label: string;
  status: string;
  status_label: string;
  unread_count: number;
  messages: SupportMessage[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

export type TicketPayload = {
  subject: string;
  category: string;
  priority: string;
  order?: number | null;
  message: string;
  files?: File[];
};

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  link: string;
  event_type: string;
  is_read: boolean;
  created_at: string;
};

async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>) {
  const response = await request;
  return response.data.data;
}

function ticketFormData(payload: TicketPayload | { message: string; files?: File[] }) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "files" || value === undefined || value === null) return;
    formData.append(key, String(value));
  });

  payload.files?.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}

export function getAccountDashboard() {
  return unwrap(api.get<ApiEnvelope<DashboardData>>("/account/dashboard/"));
}

export function getAccountProfile() {
  return unwrap(api.get<ApiEnvelope<{ user: AuthUser }>>("/account/profile/"));
}

export function updateAccountProfile(payload: Partial<AuthUser>) {
  return unwrap(api.patch<ApiEnvelope<{ user: AuthUser }>>("/account/profile/", payload));
}

export function changeAccountPassword(payload: { current_password: string; new_password: string }) {
  return unwrap(api.post<ApiEnvelope<Record<string, never>>>("/account/security/password/", payload));
}

export function getAddresses() {
  return unwrap(api.get<ApiEnvelope<{ addresses: CustomerAddress[] }>>("/account/addresses/"));
}

export function createAddress(payload: AddressPayload) {
  return unwrap(api.post<ApiEnvelope<{ address: CustomerAddress }>>("/account/addresses/", payload));
}

export function updateAddress(id: number, payload: Partial<AddressPayload>) {
  return unwrap(api.patch<ApiEnvelope<{ address: CustomerAddress }>>(`/account/addresses/${id}/`, payload));
}

export function deleteAddress(id: number) {
  return unwrap(api.delete<ApiEnvelope<Record<string, never>>>(`/account/addresses/${id}/`));
}

export function setDefaultAddress(id: number) {
  return unwrap(api.post<ApiEnvelope<{ address: CustomerAddress }>>(`/account/addresses/${id}/default/`));
}

export function getAccountOrders() {
  return unwrap(api.get<ApiEnvelope<{ orders: Order[] }>>("/account/orders/"));
}

export function getAccountOrder(id: number | string) {
  return unwrap(api.get<ApiEnvelope<{ order: Order }>>(`/account/orders/${id}/`));
}

export function getOffers() {
  return unwrap(api.get<ApiEnvelope<{ offers: CustomerOffer[] }>>("/account/offers/"));
}

export function validateOffer(payload: { coupon_code: string; order_amount: string | number; shipping_cost?: string | number }) {
  return unwrap(api.post<ApiEnvelope<ValidatedOffer>>("/checkout/validate-offer/", payload));
}

export function getTickets() {
  return unwrap(api.get<ApiEnvelope<{ tickets: SupportTicket[] }>>("/account/tickets/"));
}

export function createTicket(payload: TicketPayload) {
  return unwrap(api.post<ApiEnvelope<{ ticket: SupportTicket }>>("/account/tickets/", ticketFormData(payload)));
}

export function getTicket(id: number | string) {
  return unwrap(api.get<ApiEnvelope<{ ticket: SupportTicket }>>(`/account/tickets/${id}/`));
}

export function replyTicket(id: number | string, payload: { message: string; files?: File[] }) {
  return unwrap(api.post<ApiEnvelope<{ ticket: SupportTicket }>>(`/account/tickets/${id}/messages/`, ticketFormData(payload)));
}

export function closeTicket(id: number | string) {
  return unwrap(api.post<ApiEnvelope<Record<string, never>>>(`/account/tickets/${id}/close/`));
}

export function getNotifications() {
  return unwrap(api.get<ApiEnvelope<{ notifications: NotificationItem[] }>>("/account/notifications/"));
}

export function readNotification(id: number) {
  return unwrap(api.patch<ApiEnvelope<Record<string, never>>>(`/account/notifications/${id}/read/`));
}

export function readAllNotifications() {
  return unwrap(api.post<ApiEnvelope<Record<string, never>>>("/account/notifications/read-all/"));
}
