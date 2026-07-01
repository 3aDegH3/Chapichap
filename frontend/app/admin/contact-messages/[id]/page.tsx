import AdminContactMessageDetailClient from "./admin-contact-message-detail-client";

export default async function AdminContactMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminContactMessageDetailClient messageId={Number(id)} />;
}
