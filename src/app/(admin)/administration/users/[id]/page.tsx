import { AdministrationUserProfilePage } from "@/components/administration/user-profile-page";

export default async function AdministrationUserProfileRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdministrationUserProfilePage userId={id} />;
}
