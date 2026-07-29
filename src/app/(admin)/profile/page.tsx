import { ProfileIdentityForm } from "@/components/profile/profile-identity-form";
import { ProfilePageShell } from "@/components/profile/profile-page-shell";

export default function ProfilePage() {
  return (
    <ProfilePageShell>
      <ProfileIdentityForm />
    </ProfilePageShell>
  );
}
