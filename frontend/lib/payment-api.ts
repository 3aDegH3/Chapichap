import { api } from "@/lib/api";

export type PaymentMethodCode = "IN_PERSON" | "ONLINE_GATEWAY" | "BANK_TRANSFER" | "CASH_ON_DELIVERY";
export type PaymentStatus = "pending" | "successful" | "failed" | "canceled" | "expired";

export type PaymentTransaction = {
  id: number;
  order_number: string;
  amount: string;
  gateway: string;
  status: PaymentStatus;
  gateway_reference: string | null;
  tracking_code: string;
  receipt_number: string;
  failure_reason: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentMethod = {
  code: PaymentMethodCode;
  title: string;
  description: string;
  is_active: boolean;
  requires_redirect: boolean;
};

export type Payment = {
  id: number;
  order: number;
  order_number: string;
  amount: string;
  method: PaymentMethodCode;
  method_label: string;
  provider: string;
  status: PaymentStatus;
  status_label: string;
  provider_reference: string | null;
  tracking_code: string;
  receipt_number: string;
  failure_reason: string;
  paid_at: string | null;
  requires_redirect: boolean;
  next_action: {
    type: "SHOW_INSTRUCTIONS" | "REDIRECT" | "NONE";
    url?: string;
  };
  latest_transaction: PaymentTransaction | null;
  created_at: string;
  updated_at: string;
};

export async function getPaymentMethods() {
  const response = await api.get<PaymentMethod[]>("/payment-methods/");
  return response.data;
}

export async function initializePayment(
  orderId: number,
  method: PaymentMethodCode,
  idempotencyKey?: string
) {
  const response = await api.post<Payment>("/payments/init/", {
    order_id: orderId,
    method,
    idempotency_key: idempotencyKey || undefined,
  });

  return response.data;
}

export async function getPayment(paymentId: number | string) {
  const response = await api.get<Payment>(`/payments/${paymentId}/`);
  return response.data;
}

export async function submitMockPaymentCallback(transactionId: number | string, status: PaymentStatus) {
  const response = await api.post<Payment>("/payments/mock/callback/", {
    transaction_id: transactionId,
    status,
  });

  return response.data;
}
