"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  type CurrentProfile,
  profileBackupCodes,
} from "@/components/profile/profile-data";
import { ProfileSection } from "@/components/profile/profile-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";

export function ManageMfaCard({
  profile,
  onProfileChange,
}: {
  profile: CurrentProfile;
  onProfileChange: (next: CurrentProfile) => void;
}) {
  const [disableOpen, setDisableOpen] = useState(false);
  const [codesOpen, setCodesOpen] = useState(false);

  const handleEnable = () => {
    onProfileChange({
      ...profile,
      mfaEnabled: true,
      backupCodesRemaining: profileBackupCodes.length,
    });
    toast({
      title: "MFA enabled",
      description: "Authenticator enrollment completed. Save your backup codes.",
    });
    setCodesOpen(true);
  };

  const handleDisable = () => {
    onProfileChange({
      ...profile,
      mfaEnabled: false,
      backupCodesRemaining: 0,
    });
    setDisableOpen(false);
    toast({
      title: "MFA disabled",
      description: "Your account no longer requires a second factor.",
      variant: "destructive",
    });
  };

  const handleRegenerateCodes = () => {
    onProfileChange({
      ...profile,
      backupCodesRemaining: profileBackupCodes.length,
    });
    setCodesOpen(true);
    toast({
      title: "Backup codes regenerated",
      description: "Previous codes no longer work. Store the new set securely.",
    });
  };

  return (
    <>
      <ProfileSection
        id="mfa"
        title="Manage MFA"
        description="Require a second factor when signing in to the console."
        action={
          <Badge
            variant="outline"
            className={
              profile.mfaEnabled
                ? "rounded-full border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "rounded-full border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }
          >
            {profile.mfaEnabled ? "Enabled" : "Disabled"}
          </Badge>
        }
      >
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-md border px-4 py-3 text-sm">
            {profile.mfaEnabled ? (
              <p>
                Authenticator app is enrolled.{" "}
                <span className="text-muted-foreground">
                  {profile.backupCodesRemaining} backup code
                  {profile.backupCodesRemaining === 1 ? "" : "s"} remaining.
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground">
                MFA is off. Enable it to improve your Security Snapshot score.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.mfaEnabled ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCodesOpen(true)}
                >
                  View backup codes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateCodes}
                >
                  Regenerate codes
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setDisableOpen(true)}
                >
                  Disable MFA
                </Button>
              </>
            ) : (
              <Button type="button" size="sm" onClick={handleEnable}>
                Enable MFA
              </Button>
            )}
          </div>
        </div>
      </ProfileSection>

      <ConfirmDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        title="Disable MFA?"
        desc="You will only need your password to sign in. This weakens account protection."
        confirmText="Disable MFA"
        destructive
        handleConfirm={handleDisable}
      />

      <Dialog open={codesOpen} onOpenChange={setCodesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup codes</DialogTitle>
            <DialogDescription>
              Use these one-time codes if you lose access to your authenticator.
              Store them somewhere safe.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/40 grid grid-cols-2 gap-2 rounded-md border p-4 font-mono text-sm">
            {profileBackupCodes.map((code) => (
              <span key={code}>{code}</span>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(profileBackupCodes.join("\n"));
                toast({
                  title: "Copied",
                  description: "Backup codes copied to clipboard.",
                });
              }}
            >
              Copy codes
            </Button>
            <Button type="button" onClick={() => setCodesOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
