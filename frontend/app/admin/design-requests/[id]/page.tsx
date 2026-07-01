import AdminDesignRequestDetailClient from "./admin-design-request-detail-client";

export default async function AdminDesignRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminDesignRequestDetailClient designRequestId={Number(id)} />;
}
