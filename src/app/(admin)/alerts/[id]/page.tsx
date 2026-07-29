import { AlertDetailView } from "@/components/alerts/alert-detail-view";

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AlertDetailView alertId={decodeURIComponent(id)} />;
}
