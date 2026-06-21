import { api } from "@/lib/api";
import type { PaginatedResponse, Product } from "@/lib/products-api";

export type UploadedFileResponse = {
  id: number;
  file: string;
  file_url: string;
  original_name: string;
  content_type: string;
  size: number;
  created_at: string;
};

export type DesignRequestPayload = {
  product_id?: number | null;
  order_type: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  uploaded_file_id?: number | null;
};

export type DesignRequest = {
  id: number;
  product: Product | null;
  order_type: string;
  order_type_label: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  uploaded_file: UploadedFileResponse | null;
  status: string;
  status_label: string;
  created_at: string;
  updated_at: string;
};

export async function uploadDesignFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<UploadedFileResponse>("/upload/", formData);

  return response.data;
}

export async function createDesignRequest(payload: DesignRequestPayload) {
  const response = await api.post<DesignRequest>("/design-requests/", payload);
  return response.data;
}

export async function getDesignRequests() {
  const response = await api.get<DesignRequest[] | PaginatedResponse<DesignRequest>>("/design-requests/");
  return Array.isArray(response.data) ? response.data : response.data.results;
}
