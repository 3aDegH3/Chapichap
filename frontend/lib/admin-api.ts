import { api } from "@/lib/api";

export type AdminUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  admin_role: "super_admin" | "order_manager" | "product_manager" | "support";
  admin_role_label: string;
  admin_permissions: AdminPermission[];
};

export type AdminPermission =
  | "dashboard"
  | "products"
  | "categories"
  | "orders"
  | "design_requests"
  | "contact_messages"
  | "customer_files"
  | "customers"
  | "activity_logs"
  | "settings";

export type AdminMeResponse = {
  success: boolean;
  message: string;
  data: {
    user: AdminUser;
  };
};

export function getAdminMe() {
  return api.get<AdminMeResponse>("/admin/me/");
}

export type AdminManager = {
  id: number;
  email: string;
  full_name: string;
  phone_number: string | null;
  admin_role: AdminUser["admin_role"];
  admin_role_label: string;
  admin_permissions: AdminPermission[];
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  can_edit: boolean;
  date_joined: string;
  last_login: string | null;
};

export type ManageableAdminRole = "order_manager" | "product_manager" | "support";

export function getAdminManagers({
  page = 1,
  search,
  role,
  isActive,
}: {
  page?: number;
  search?: string;
  role?: string;
  isActive?: string;
}) {
  return api.get<AdminPaginatedResponse<AdminManager>>("/admin/settings/admin-users/", {
    params: {
      page,
      q: search || undefined,
      role: role || undefined,
      is_active: isActive || undefined,
    },
  });
}

export function grantAdminManagerAccess(email: string, adminRole: ManageableAdminRole) {
  return api.post<{ success: boolean; message: string; data: { manager: AdminManager } }>(
    "/admin/settings/admin-users/",
    { email, admin_role: adminRole }
  );
}

export function updateAdminManager(
  managerId: number,
  payload: { admin_role?: ManageableAdminRole | ""; is_active?: boolean }
) {
  return api.patch<{ success: boolean; message: string; data: { manager: AdminManager } }>(
    `/admin/settings/admin-users/${managerId}/`,
    payload
  );
}

export type AdminDashboardStats = {
  new_orders: number;
  reviewing_orders: number;
  ready_for_print_orders: number;
  ready_to_ship_orders: number;
  new_design_requests: number;
  unread_contact_messages: number;
  low_stock_products: number;
  customers: number;
};

export type AdminDashboardOrder = {
  id: number;
  order_number: string;
  receiver_name: string;
  phone: string;
  total_amount: string;
  status: string;
  status_label: string;
  payment_status: string | null;
  payment_status_label: string;
  delivery_method: string;
  delivery_method_label: string;
  created_at: string;
};

export type AdminDashboardDesignRequest = {
  id: number;
  contact_name: string;
  contact_phone: string;
  order_type: string;
  order_type_label: string;
  status: string;
  status_label: string;
  created_at: string;
};

export type AdminDashboardProduct = {
  id: number;
  title: string;
  slug: string;
  category_title: string | null;
  stock_quantity: number;
  is_active: boolean;
  updated_at: string;
};

export type AdminDashboardContactMessage = {
  id: number;
  full_name: string;
  phone: string;
  subject: string;
  subject_label: string;
  status: string;
  status_label: string;
  created_at: string;
};

export type AdminActivityLog = {
  id: number;
  actor: number | null;
  actor_label: string;
  action: string;
  action_label: string;
  entity_type: string;
  entity_type_label: string;
  entity_id: string;
  description: string;
  ip_address: string | null;
  created_at: string;
};

export type AdminCustomerFile = {
  id: number;
  source: "design" | "support";
  filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  uploaded_by_label: string;
  related_type: string;
  related_id: number | null;
  related_label: string;
  order_id: number | null;
  order_number: string;
  preview_url: string | null;
  download_url: string;
};

export type AdminDashboardResponse = {
  success: boolean;
  message: string;
  data: {
    stats: AdminDashboardStats;
    low_stock_threshold: number;
    latest_orders: AdminDashboardOrder[];
    latest_design_requests: AdminDashboardDesignRequest[];
    low_stock_products: AdminDashboardProduct[];
    latest_contact_messages: AdminDashboardContactMessage[];
    can_view_activity_logs: boolean;
    recent_admin_activities: AdminActivityLog[];
  };
};

export function getAdminDashboard() {
  return api.get<AdminDashboardResponse>("/admin/dashboard/");
}

export function getAdminActivityLogs({
  page = 1,
  search,
  action,
  entityType,
  dateFrom,
  dateTo,
}: {
  page?: number;
  search?: string;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return api.get<AdminPaginatedResponse<AdminActivityLog>>("/admin/activity-logs/", {
    params: {
      page,
      q: search || undefined,
      action: action || undefined,
      entity_type: entityType || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    },
  });
}

export type AdminContactMessageStatus = "new" | "read" | "replied" | "closed";

export type AdminContactMessage = {
  id: number;
  full_name: string;
  phone: string;
  subject: string;
  subject_label: string;
  status: AdminContactMessageStatus;
  status_label: string;
  contact_permission: boolean;
  notes_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminContactMessageDetail = AdminContactMessage & {
  message: string;
};

export type AdminContactMessageInternalNote = {
  id: number;
  contact_message: number;
  author: number | null;
  author_label: string;
  text: string;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
};

export function getAdminContactMessages({
  page = 1,
  search,
  status,
  subject,
}: {
  page?: number;
  search?: string;
  status?: string;
  subject?: string;
}) {
  return api.get<AdminPaginatedResponse<AdminContactMessage>>("/admin/contact-messages/", {
    params: {
      page,
      q: search || undefined,
      status: status || undefined,
      subject: subject || undefined,
    },
  });
}

export function getAdminContactMessage(messageId: number) {
  return api.get<AdminContactMessageDetail>(`/admin/contact-messages/${messageId}/`);
}

export function updateAdminContactMessageStatus(messageId: number, status: AdminContactMessageStatus) {
  return api.patch<{
    success: boolean;
    message: string;
    data: { contact_message: AdminContactMessageDetail };
  }>(`/admin/contact-messages/${messageId}/status/`, { status });
}

export function markAdminContactMessagesRead(ids: number[]) {
  return api.patch<{ success: boolean; message: string; data: { updated_count: number } }>(
    "/admin/contact-messages/bulk-read/",
    { ids }
  );
}

export function deleteAdminContactMessage(messageId: number) {
  return api.delete(`/admin/contact-messages/${messageId}/`);
}

export function getAdminContactMessageInternalNotes(messageId: number) {
  return api.get<AdminContactMessageInternalNote[]>(`/admin/contact-messages/${messageId}/notes/`);
}

export function createAdminContactMessageInternalNote(messageId: number, text: string) {
  return api.post<{
    success: boolean;
    message: string;
    data: { note: AdminContactMessageInternalNote };
  }>(`/admin/contact-messages/${messageId}/notes/`, { text });
}

export function updateAdminContactMessageInternalNote(messageId: number, noteId: number, text: string) {
  return api.patch<{
    success: boolean;
    message: string;
    data: { note: AdminContactMessageInternalNote };
  }>(`/admin/contact-messages/${messageId}/notes/${noteId}/`, { text });
}

export function deleteAdminContactMessageInternalNote(messageId: number, noteId: number) {
  return api.delete(`/admin/contact-messages/${messageId}/notes/${noteId}/`);
}

export function getAdminCustomerFiles({
  page = 1,
  search,
  source,
}: {
  page?: number;
  search?: string;
  source?: string;
}) {
  return api.get<AdminPaginatedResponse<AdminCustomerFile>>("/admin/customer-files/", {
    params: {
      page,
      q: search || undefined,
      source: source || undefined,
    },
  });
}

export function getAdminCustomerFileBlob(file: AdminCustomerFile, mode: "preview" | "download") {
  return api.get<Blob>(`/admin/customer-files/${file.source}/${file.id}/${mode}/`, {
    responseType: "blob",
  });
}

export type AdminProductCategory = {
  id: number;
  title: string;
  slug: string;
  is_active: boolean;
};

export type AdminProduct = {
  id: number;
  category: number | null;
  category_detail: AdminProductCategory | null;
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
  gallery_images: AdminProductImage[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminProductImage = {
  id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
};

export type AdminProductsQuery = {
  page?: number;
  search?: string;
  category?: string;
  availability?: "in_stock" | "out_of_stock" | "";
  isActive?: "true" | "false" | "";
  ordering?: string;
};

export type AdminPaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function getAdminProducts({
  page = 1,
  search,
  category,
  availability,
  isActive,
  ordering,
}: AdminProductsQuery) {
  return api.get<AdminPaginatedResponse<AdminProduct>>("/admin/products/", {
    params: {
      page,
      q: search || undefined,
      category: category || undefined,
      availability: availability || undefined,
      is_active: isActive || undefined,
      ordering: ordering || undefined,
    },
  });
}

export function getAdminProductCategories() {
  return api.get<AdminProductCategory[]>("/admin/products/categories/");
}

export function getAdminProduct(productId: number) {
  return api.get<AdminProduct>(`/admin/products/${productId}/`);
}

export function createAdminProduct(payload: FormData) {
  return api.post<AdminProduct>("/admin/products/", payload);
}

export function updateAdminProduct(productId: number, payload: FormData) {
  return api.patch<AdminProduct>(`/admin/products/${productId}/`, payload);
}

export function setAdminProductPrimaryImage(productId: number, imageId: number) {
  return api.patch<{ success: boolean; message: string; data: { product: AdminProduct } }>(
    `/admin/products/${productId}/images/${imageId}/`
  );
}

export function deleteAdminProductImage(productId: number, imageId: number) {
  return api.delete(`/admin/products/${productId}/images/${imageId}/`);
}

export function toggleAdminProductActive(productId: number) {
  return api.patch<{ success: boolean; message: string; data: { product: AdminProduct } }>(
    `/admin/products/${productId}/toggle-active/`
  );
}

export function softDeleteAdminProduct(productId: number) {
  return api.delete(`/admin/products/${productId}/`);
}

export type AdminInventoryChange = {
  id: number;
  previous_quantity: number;
  new_quantity: number;
  change_type: string;
  change_type_label: string;
  note: string;
  changed_by: number | null;
  changed_by_label: string;
  created_at: string;
};

export function getAdminProductInventoryHistory(productId: number) {
  return api.get<AdminPaginatedResponse<AdminInventoryChange>>(
    `/admin/products/${productId}/inventory-history/`
  );
}

export type AdminCategory = {
  id: number;
  title: string;
  slug: string;
  description: string;
  parent: number | null;
  image: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  children_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminCategoriesQuery = {
  page?: number;
  search?: string;
  isActive?: "true" | "false" | "";
  ordering?: string;
};

export function getAdminCategories({
  page = 1,
  search,
  isActive,
  ordering,
}: AdminCategoriesQuery) {
  return api.get<AdminPaginatedResponse<AdminCategory>>("/admin/categories/", {
    params: {
      page,
      q: search || undefined,
      is_active: isActive || undefined,
      ordering: ordering || undefined,
    },
  });
}

export function createAdminCategory(payload: FormData) {
  return api.post<AdminCategory>("/admin/categories/", payload);
}

export function updateAdminCategory(categoryId: number, payload: FormData) {
  return api.patch<AdminCategory>(`/admin/categories/${categoryId}/`, payload);
}

export function deleteAdminCategory(categoryId: number) {
  return api.delete(`/admin/categories/${categoryId}/`);
}

export type AdminDesignRequestStatus =
  | "received"
  | "reviewing"
  | "needs_info"
  | "designing"
  | "ready_for_approval"
  | "approved"
  | "rejected"
  | "closed";

export type AdminDesignRequestFile = {
  id: number;
  original_name: string;
  content_type: string;
  size: number;
  preview_url: string | null;
  download_url: string;
  created_at: string;
};

export type AdminDesignRequest = {
  id: number;
  request_number: string;
  customer_name: string;
  customer_phone: string;
  contact_email: string;
  product: number | null;
  product_title: string | null;
  order: number | null;
  order_number: string | null;
  order_type: string;
  order_type_label: string;
  status: AdminDesignRequestStatus;
  status_label: string;
  files_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminDesignRequestStatusHistory = {
  id: number;
  previous_status: string;
  previous_status_label: string;
  new_status: string;
  new_status_label: string;
  note: string;
  created_by: number | null;
  created_by_label: string;
  created_at: string;
};

export type AdminDesignRequestDetail = AdminDesignRequest & {
  user: number | null;
  user_email: string | null;
  user_full_name: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  uploaded_file: AdminDesignRequestFile | null;
  admin_response: string;
  admin_response_at: string | null;
  responded_by: number | null;
  status_history: AdminDesignRequestStatusHistory[];
};

export type AdminDesignRequestInternalNote = {
  id: number;
  design_request: number;
  author: number | null;
  author_label: string;
  text: string;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminDesignRequestsQuery = {
  page?: number;
  search?: string;
  status?: string;
  orderType?: string;
  ordering?: string;
};

export function getAdminDesignRequests({
  page = 1,
  search,
  status,
  orderType,
  ordering,
}: AdminDesignRequestsQuery) {
  return api.get<AdminPaginatedResponse<AdminDesignRequest>>("/admin/design-requests/", {
    params: {
      page,
      q: search || undefined,
      status: status || undefined,
      order_type: orderType || undefined,
      ordering: ordering || undefined,
    },
  });
}

export function getAdminDesignRequest(designRequestId: number) {
  return api.get<AdminDesignRequestDetail>(`/admin/design-requests/${designRequestId}/`);
}

export function updateAdminDesignRequestStatus(
  designRequestId: number,
  payload: { status: AdminDesignRequestStatus; note?: string }
) {
  return api.patch<{
    success: boolean;
    message: string;
    data: { design_request: AdminDesignRequestDetail };
  }>(`/admin/design-requests/${designRequestId}/status/`, payload);
}

export function updateAdminDesignRequestResponse(designRequestId: number, adminResponse: string) {
  return api.post<{
    success: boolean;
    message: string;
    data: { design_request: AdminDesignRequestDetail };
  }>(`/admin/design-requests/${designRequestId}/reply/`, { admin_response: adminResponse });
}

export function linkAdminDesignRequestOrder(designRequestId: number, orderId: number | null) {
  return api.patch<{
    success: boolean;
    message: string;
    data: { design_request: AdminDesignRequestDetail };
  }>(`/admin/design-requests/${designRequestId}/order/`, { order_id: orderId });
}

export function getAdminDesignRequestStatusHistory(designRequestId: number) {
  return api.get<AdminPaginatedResponse<AdminDesignRequestStatusHistory>>(
    `/admin/design-requests/${designRequestId}/history/`
  );
}

export function getAdminDesignRequestInternalNotes(designRequestId: number) {
  return api.get<AdminDesignRequestInternalNote[]>(`/admin/design-requests/${designRequestId}/notes/`);
}

export function createAdminDesignRequestInternalNote(designRequestId: number, text: string) {
  return api.post<{
    success: boolean;
    message: string;
    data: { note: AdminDesignRequestInternalNote };
  }>(`/admin/design-requests/${designRequestId}/notes/`, { text });
}

export function updateAdminDesignRequestInternalNote(designRequestId: number, noteId: number, text: string) {
  return api.patch<{
    success: boolean;
    message: string;
    data: { note: AdminDesignRequestInternalNote };
  }>(`/admin/design-requests/${designRequestId}/notes/${noteId}/`, { text });
}

export function deleteAdminDesignRequestInternalNote(designRequestId: number, noteId: number) {
  return api.delete(`/admin/design-requests/${designRequestId}/notes/${noteId}/`);
}

export function getAdminDesignRequestFileBlob(fileId: number, mode: "preview" | "download") {
  return api.get<Blob>(`/admin/customer-files/design/${fileId}/${mode}/`, {
    responseType: "blob",
  });
}

export type AdminCustomer = {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string;
  date_joined: string;
  order_count: number;
  total_order_amount: string;
  last_order_at: string | null;
  account_status: "active" | "inactive";
  account_status_label: string;
};

export type AdminCustomerAddress = {
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

export type AdminCustomerOrder = {
  id: number;
  order_number: string;
  receiver_name: string;
  phone: string;
  total_amount: string;
  status: string;
  status_label: string;
  created_at: string;
};

export type AdminCustomerDetail = AdminCustomer & {
  username: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  email_verified: boolean;
  last_login: string | null;
  addresses: AdminCustomerAddress[];
  orders: AdminCustomerOrder[];
  design_requests: AdminDesignRequest[];
  contact_messages: AdminContactMessageDetail[];
  files: AdminCustomerFile[];
};

export function getAdminCustomers({
  page = 1,
  search,
  isActive,
  ordering,
}: {
  page?: number;
  search?: string;
  isActive?: string;
  ordering?: string;
}) {
  return api.get<AdminPaginatedResponse<AdminCustomer>>("/admin/customers/", {
    params: {
      page,
      q: search || undefined,
      is_active: isActive || undefined,
      ordering: ordering || undefined,
    },
  });
}

export function getAdminCustomer(customerId: number) {
  return api.get<AdminCustomerDetail>(`/admin/customers/${customerId}/`);
}

export type AdminOrder = {
  id: number;
  order_number: string;
  receiver_name: string;
  phone: string;
  customer_email: string | null;
  total_amount: string;
  status: string;
  status_label: string;
  payment_status: string | null;
  payment_status_label: string;
  payment_method_label: string;
  tracking_code: string;
  delivery_method: "SHIPPING" | "PICKUP";
  delivery_method_label: string;
  items_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminOrderItem = {
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

export type AdminOrderStatusHistory = {
  id: number;
  previous_status: string;
  previous_status_label: string;
  new_status: string;
  new_status_label: string;
  title: string;
  description: string;
  note: string;
  visible_to_customer: boolean;
  changed_by: number | null;
  changed_by_label: string;
  created_by: number | null;
  created_by_label: string;
  created_at: string;
};

export type AdminOrderPayment = {
  id: number;
  amount: string;
  method: string;
  method_label: string;
  status: string;
  status_label: string;
  provider: string;
  provider_reference: string | null;
  tracking_code: string;
  receipt_number: string;
  failure_reason: string;
  paid_at: string | null;
  created_at: string;
};

export type AdminOrderDetail = {
  id: number;
  order_number: string;
  user: number | null;
  customer_email: string | null;
  customer_full_name: string;
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  delivery_method: "SHIPPING" | "PICKUP";
  delivery_method_label: string;
  shipping_provider: string;
  shipping_tracking_code: string;
  shipping_cost: string;
  subtotal: string;
  discount_amount: string;
  coupon_code: string;
  total_amount: string;
  status: string;
  status_label: string;
  notes: string;
  items: AdminOrderItem[];
  payment: AdminOrderPayment | null;
  status_history: AdminOrderStatusHistory[];
  customer_files: AdminCustomerFile[];
  created_at: string;
  updated_at: string;
};

export type AdminOrderInternalNote = {
  id: number;
  order: number;
  author: number | null;
  author_label: string;
  text: string;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminOrdersQuery = {
  page?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  deliveryMethod?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function getAdminOrders({
  page = 1,
  search,
  status,
  paymentStatus,
  deliveryMethod,
  dateFrom,
  dateTo,
}: AdminOrdersQuery) {
  return api.get<AdminPaginatedResponse<AdminOrder>>("/admin/orders/", {
    params: {
      page,
      q: search || undefined,
      status: status || undefined,
      payment_status: paymentStatus || undefined,
      delivery_method: deliveryMethod || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    },
  });
}

export function exportAdminOrdersCSV({
  search,
  status,
  paymentStatus,
  deliveryMethod,
  dateFrom,
  dateTo,
}: AdminOrdersQuery) {
  return api.get<Blob>("/admin/orders/export/csv/", {
    params: {
      q: search || undefined,
      status: status || undefined,
      payment_status: paymentStatus || undefined,
      delivery_method: deliveryMethod || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    },
    responseType: "blob",
  });
}

export function getAdminOrder(orderId: number) {
  return api.get<AdminOrderDetail>(`/admin/orders/${orderId}/`);
}

export function updateAdminOrderStatus(
  orderId: number,
  payload: { status: string; note?: string; visible_to_customer?: boolean }
) {
  return api.patch<{ success: boolean; message: string; data: { order: AdminOrderDetail } }>(
    `/admin/orders/${orderId}/status/`,
    payload
  );
}

export function updateAdminOrderShipping(
  orderId: number,
  payload: {
    delivery_method?: "SHIPPING" | "PICKUP";
    shipping_provider?: string;
    shipping_tracking_code?: string;
  }
) {
  return api.patch<{ success: boolean; message: string; data: { order: AdminOrderDetail } }>(
    `/admin/orders/${orderId}/shipping/`,
    payload
  );
}

export function getAdminOrderStatusHistory(orderId: number) {
  return api.get<AdminPaginatedResponse<AdminOrderStatusHistory>>(
    `/admin/orders/${orderId}/history/`
  );
}

export function getAdminOrderInternalNotes(orderId: number) {
  return api.get<AdminOrderInternalNote[]>(`/admin/orders/${orderId}/notes/`);
}

export function createAdminOrderInternalNote(orderId: number, text: string) {
  return api.post<{ success: boolean; message: string; data: { note: AdminOrderInternalNote } }>(
    `/admin/orders/${orderId}/notes/`,
    { text }
  );
}

export function updateAdminOrderInternalNote(orderId: number, noteId: number, text: string) {
  return api.patch<{ success: boolean; message: string; data: { note: AdminOrderInternalNote } }>(
    `/admin/orders/${orderId}/notes/${noteId}/`,
    { text }
  );
}

export function deleteAdminOrderInternalNote(orderId: number, noteId: number) {
  return api.delete(`/admin/orders/${orderId}/notes/${noteId}/`);
}
