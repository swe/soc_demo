"use client";

import { useState } from "react";

import { ActiveSessionsCard } from "@/components/profile/active-sessions-card";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { HardTokensCard } from "@/components/profile/hard-tokens-card";
import { ManageMfaCard } from "@/components/profile/manage-mfa-card";
import {
  currentProfile,
  type CurrentProfile,
} from "@/components/profile/profile-data";
import { SecuritySnapshot } from "@/components/profile/security-snapshot";

export function ProfileSecurityPage() {
  const [profile, setProfile] = useState<CurrentProfile>(currentProfile);

  return (
    <div className="space-y-6">
      <SecuritySnapshot profile={profile} />
      <ManageMfaCard profile={profile} onProfileChange={setProfile} />
      <ChangePasswordForm profile={profile} onProfileChange={setProfile} />
      <HardTokensCard profile={profile} onProfileChange={setProfile} />
      <ActiveSessionsCard profile={profile} onProfileChange={setProfile} />
    </div>
  );
}
