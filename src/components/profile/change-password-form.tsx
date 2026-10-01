"use client";

import { useState } from "react";

import { PasswordInput } from "@/components/password-input";
import { type CurrentProfile } from "@/components/profile/profile-data";
import { ProfileSection } from "@/components/profile/profile-section";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "@/lib/toast";

export function ChangePasswordForm({
  profile,
  onProfileChange,
}: {
  profile: CurrentProfile;
  onProfileChange: (next: CurrentProfile) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Fill in current, new, and confirm password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirmation must be the same.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    const label = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    onProfileChange({
      ...profile,
      passwordChangedAt: iso,
      passwordChangedLabel: label,
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    toast({
      title: "Password updated",
      description: "Your password was changed successfully.",
    });
  };

  return (
    <ProfileSection
      id="password"
      title="Change password"
      description="Use a unique password you do not reuse on other sites."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-muted-foreground text-caption font-medium">
          Last changed · {profile.passwordChangedLabel}
        </p>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="current-password">Current password</FieldLabel>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="new-password">New password</FieldLabel>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
            <FieldDescription>At least 8 characters.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm-password">
              Confirm new password
            </FieldLabel>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </Field>
        </FieldGroup>

        <div className="flex justify-end">
          <Button type="submit">Update password</Button>
        </div>
      </form>
    </ProfileSection>
  );
}
