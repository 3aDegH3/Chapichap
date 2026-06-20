import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/products-api";

export type WorkType =
  | "mug"
  | "tshirt"
  | "gift"
  | "branding"
  | "design";

export type PortfolioItem = {
  id: number;
  title: string;
  slug: string;
  work_type: WorkType;
  work_type_label: string;
  client_name: string;
  short_description: string;
  description: string;
  cover_image: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  completed_at: string | null;
  created_at: string;
};

export type PortfolioImage = {
  id: number;
  image: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
};

export type PortfolioDetail = PortfolioItem & {
  images: PortfolioImage[];
  related_items: PortfolioItem[];
};

type PortfolioQuery = {
  page?: number;
  workType?: string;
  search?: string;
};

export const workTypeOptions: Array<{
  value: WorkType;
  label: string;
}> = [
  { value: "mug", label: "چاپ روی ماگ" },
  { value: "tshirt", label: "چاپ روی تیشرت" },
  { value: "gift", label: "هدیه اختصاصی" },
  { value: "branding", label: "هدیه تبلیغاتی" },
  { value: "design", label: "طراحی اختصاصی" },
];

export async function getPortfolioItems({
  page = 1,
  workType,
  search,
}: PortfolioQuery) {
  const response = await api.get<PaginatedResponse<PortfolioItem>>("/portfolio/", {
    params: {
      page,
      work_type: workType || undefined,
      search: search || undefined,
    },
  });

  return response.data;
}

export async function getPortfolioItem(slug: string) {
  const response = await api.get<PortfolioDetail>(`/portfolio/${slug}/`);
  return response.data;
}
