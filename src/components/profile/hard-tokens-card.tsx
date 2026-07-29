"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { HardTokenOnboardingDialog } from "@/components/profile/hard-token-onboarding-dialog";
import {
  type CurrentProfile,
  type ProfileHardToken,
} from "@/components/profile/profile-data";
import { ProfileSection } from "@/components/profile/profile-section";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export function HardTokensCard({
  profile,
  onProfileChange,
}: {
  profile: CurrentProfile;
  onProfileChange: (next: CurrentProfile) => void;
}) {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [revokeToken, setRevokeToken] = useState<ProfileHardToken | null>(null);

  const defaultName = `Security key ${profile.hardTokens.length + 1}`;

  const handleOnboardingComplete = ({ name }: { name: string }) => {
    const nextToken: ProfileHardToken = {
      id: `token-${Date.now()}`,
      name,
      registeredLabel: "Just now",
      lastUsedLabel: "Never",
    };

    onProfileChange({
      ...profile,
      hardTokens: [...profile.hardTokens, nextToken],
    });

    toast({
      title: "Hard token registered",
      description: `${nextToken.name} is ready for phishing-resistant sign-in.`,
    });
  };

  const handleRevoke = () => {
    if (!revokeToken) {
      return;
    }

    onProfileChange({
      ...profile,
      hardTokens: profile.hardTokens.filter(
        (token) => token.id !== revokeToken.id,
      ),
    });
    toast({
      title: "Hard token revoked",
      description: `${revokeToken.name} can no longer be used to sign in.`,
      variant: "destructive",
    });
    setRevokeToken(null);
  };

  return (
    <>
      <ProfileSection
        id="hard-tokens"
        title="Manage hard tokens"
        description="FIDO / hardware passkeys for phishing-resistant MFA."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setOnboardingOpen(true)}
          >
            Register key
          </Button>
        }
      >
        {profile.hardTokens.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-md border border-dashed px-4 py-8 text-center text-sm">
            <KeyRound className="size-5 opacity-60" />
            <div className="space-y-1">
              <p className="text-foreground font-medium">No hardware keys yet</p>
              <p>
                Register a FIDO2 security key to strengthen your Security
                Snapshot.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setOnboardingOpen(true)}
            >
              Start onboarding
            </Button>
          </div>
        ) : (
          <ul className="divide-border divide-y rounded-md border">
            {profile.hardTokens.map((token) => (
              <li
                key={token.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{token.name}</p>
                  <p className="text-muted-foreground text-xs">
                    Registered {token.registeredLabel} · Last used{" "}
                    {token.lastUsedLabel}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRevokeToken(token)}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ProfileSection>

      <HardTokenOnboardingDialog
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        defaultName={defaultName}
        onComplete={handleOnboardingComplete}
      />

      <ConfirmDialog
        open={revokeToken !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRevokeToken(null);
          }
        }}
        title="Revoke hard token?"
        desc={
          revokeToken
            ? `${revokeToken.name} will no longer authenticate this account.`
            : ""
        }
        confirmText="Revoke"
        destructive
        handleConfirm={handleRevoke}
      />
    </>
  );
}
