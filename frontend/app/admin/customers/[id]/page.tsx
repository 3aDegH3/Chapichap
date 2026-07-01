import AdminCustomerDetailClient from "./admin-customer-detail-client";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminCustomerDetailClient customerId={Number(id)} />;
}
