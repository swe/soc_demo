"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  type CurrentProfile,
  type ProfileSession,
} from "@/components/profile/profile-data";
import { ProfileSection } from "@/components/profile/profile-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/lib/toast";

export function ActiveSessionsCard({
  profile,
  onProfileChange,
}: {
  profile: CurrentProfile;
  onProfileChange: (next: CurrentProfile) => void;
}) {
  const [revokeSession, setRevokeSession] = useState<ProfileSession | null>(
    null,
  );
  const [signOutOthersOpen, setSignOutOthersOpen] = useState(false);

  const handleRevoke = () => {
    if (!revokeSession) {
      return;
    }

    onProfileChange({
      ...profile,
      sessions: profile.sessions.filter(
        (session) => session.id !== revokeSession.id,
      ),
    });
    toast({
      title: "Session revoked",
      description: `${revokeSession.device} was signed out.`,
      variant: "destructive",
    });
    setRevokeSession(null);
  };

  const handleSignOutOthers = () => {
    onProfileChange({
      ...profile,
      sessions: profile.sessions.filter((session) => session.current),
    });
    setSignOutOthersOpen(false);
    toast({
      title: "Other sessions signed out",
      description: "Only this device remains signed in.",
    });
  };

  return (
    <>
      <ProfileSection
        id="sessions"
        title="Active sessions"
        description="Devices currently signed in to your account."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={profile.sessions.every((session) => session.current)}
            onClick={() => setSignOutOthersOpen(true)}
          >
            Sign out other sessions
          </Button>
        }
      >
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {session.device}
                        </span>
                        {session.current ? (
                          <Badge
                            variant="secondary"
                            className="rounded-full"
                          >
                            This device
                          </Badge>
                        ) : null}
                        {session.stale ? (
                          <Badge
                            variant="outline"
                            className="rounded-full border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          >
                            Stale
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {session.browser}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm">{session.location}</p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {session.ip}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {session.lastActiveLabel}
                  </TableCell>
                  <TableCell className="text-right">
                    {session.current ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setRevokeSession(session)}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ProfileSection>

      <ConfirmDialog
        open={revokeSession !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRevokeSession(null);
          }
        }}
        title="Revoke session?"
        desc={
          revokeSession
            ? `${revokeSession.device} in ${revokeSession.location} will be signed out immediately.`
            : ""
        }
        confirmText="Revoke"
        destructive
        handleConfirm={handleRevoke}
      />

      <ConfirmDialog
        open={signOutOthersOpen}
        onOpenChange={setSignOutOthersOpen}
        title="Sign out other sessions?"
        desc="All devices except this one will need to sign in again."
        confirmText="Sign out others"
        destructive
        handleConfirm={handleSignOutOthers}
      />
    </>
  );
}
