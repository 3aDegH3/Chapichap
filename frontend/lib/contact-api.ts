import { api } from "@/lib/api";

export type ContactSubject =
  | "order"
  | "custom_design"
  | "collaboration"
  | "follow_up"
  | "general";

export type ContactMessagePayload = {
  full_name: string;
  phone: string;
  subject: ContactSubject;
  message: string;
  contact_permission: boolean;
};

export type ContactMessageResponse = {
  id: number;
  full_name: string;
  phone: string;
  subject: ContactSubject;
  subject_label: string;
  message: string;
  contact_permission: boolean;
  status: string;
  status_label: string;
  created_at: string;
};

export async function createContactMessage(payload: ContactMessagePayload) {
  const response = await api.post<ContactMessageResponse>(
    "/content/contact-messages/",
    payload
  );

  return response.data;
}
