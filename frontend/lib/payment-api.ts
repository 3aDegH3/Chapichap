import { api } from "@/lib/api";

export type PaymentMethodCode = "IN_PERSON" | "ONLINE_GATEWAY" | "BANK_TRANSFER" | "CASH_ON_DELIVERY";

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
  amount: string;
  method: PaymentMethodCode;
  method_label: string;
  provider: string;
  status: string;
  status_label: string;
  provider_reference: string | null;
  failure_reason: string;
  paid_at: string | null;
  requires_redirect: boolean;
  next_action: {
    type: "SHOW_INSTRUCTIONS" | "REDIRECT" | "NONE";
    url?: string;
  };
  created_at: string;
  updated_at: string;
};

export async function getPaymentMethods() {
  const response = await api.get<PaymentMethod[]>("/payment-methods/");
  return response.data;
}

export async function initializePayment(orderId: number, method: PaymentMethodCode) {
  const response = await api.post<Payment>("/payments/init/", {
    order_id: orderId,
    method,
  });

  return response.data;
}
