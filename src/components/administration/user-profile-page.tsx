"use client";

import {
  CircleX,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  openAlertStatuses,
  severityWeight as alertSeverityWeight,
} from "@/components/alerts/alerts-data";
import {
  SeverityBadge,
  StatusBadge,
} from "@/components/alerts/alerts-primitives";
import {
  getAlertSessionSnapshot,
  subscribeAlertsSession,
} from "@/components/alerts/alerts-session";
import {
  formatAuditTime,
  getAuditLogEntries,
  subscribeAuditLog,
} from "@/components/audit/audit-log-data";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  openIncidentStatuses,
  severityWeight as incidentSeverityWeight,
} from "@/components/incidents/incidents-data";
import {
  IncidentStatusBadge,
  SeverityBadge as IncidentSeverityBadge,
} from "@/components/incidents/incidents-primitives";
import {
  getIncidentSessionSnapshot,
  subscribeIncidentsSession,
} from "@/components/incidents/incidents-session";
import { ProfileSection } from "@/components/profile/profile-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { socJobRoleLabels } from "@/lib/soc-roles";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  AssignTeamsDialog,
  ChangeRoleDialog,
} from "./user-admin-dialogs";
import {
  type AdministrationAccessRole,
  type AdministrationUser,
  type AdministrationUserStatus,
  administrationStatusColors,
  getAdministrationInitials,
  getAdministrationTeams,
  isAdministrationPrivilegedRole,
} from "./users-data";
import { useUsersSession } from "./users-session";

type AdminDemoSession = {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActiveLabel: string;
  current: boolean;
  stale: boolean;
};

const statusLabels: Record<AdministrationUserStatus, string> = {
  online: "Online",
  away: "Away",
  offline: "Offline",
};

/** Deterministic demo sessions for admin dossier — no schema change required. */
function getAdminDemoSessions(user: AdministrationUser): AdminDemoSession[] {
  const hash = user.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const devices = [
    {
      device: "MacBook Pro",
      browser: "Chrome 131 · macOS",
      location: "Toronto, CA",
      ip: `142.112.${(hash % 200) + 10}.${(hash % 200) + 20}`,
    },
    {
      device: "iPhone 16",
      browser: "Safari · iOS",
      location: "Toronto, CA",
      ip: `174.112.${(hash % 180) + 5}.${(hash % 180) + 40}`,
    },
    {
      device: "Windows Workstation",
      browser: "Edge 131 · Windows",
      location: "Remote VPN",
      ip: `10.4.${(hash % 50) + 1}.${(hash % 200) + 10}`,
    },
  ] as const;

  if (user.status === "offline" || user.suspended) {
    return [
      {
        id: `${user.id}-sess-stale`,
        ...devices[hash % devices.length]!,
        lastActiveLabel: user.lastActiveLabel,
        current: false,
        stale: true,
      },
    ];
  }

  if (user.status === "away") {
    return [
      {
        id: `${user.id}-sess-1`,
        ...devices[0]!,
        lastActiveLabel: user.lastActiveLabel,
        current: true,
        stale: false,
      },
      {
        id: `${user.id}-sess-2`,
        ...devices[1]!,
        lastActiveLabel: "Yesterday",
        current: false,
        stale: true,
      },
    ];
  }

  const count = (hash % 2) + 1;
  return Array.from({ length: count }, (_, index) => ({
    id: `${user.id}-sess-${index + 1}`,
    ...devices[index]!,
    lastActiveLabel: index === 0 ? "Active now" : "2 hours ago",
    current: index === 0,
    stale: false,
  }));
}

function useAuditEntries() {
  return useSyncExternalStore(
    subscribeAuditLog,
    getAuditLogEntries,
    getAuditLogEntries,
  );
}

function useAlertsSnapshot() {
  return useSyncExternalStore(
    subscribeAlertsSession,
    getAlertSessionSnapshot,
    getAlertSessionSnapshot,
  );
}

function useIncidentsSnapshot() {
  return useSyncExternalStore(
    subscribeIncidentsSession,
    getIncidentSessionSnapshot,
    getIncidentSessionSnapshot,
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
      {children}
    </p>
  );
}

export function AdministrationUserProfilePage({ userId }: { userId: string }) {
  const router = useRouter();
  const {
    users,
    updateUserRole,
    updateUserTeams,
    suspendUsers,
    removeUserAccess,
    resetUserMfa,
  } = useUsersSession();
  const alertStore = useAlertsSnapshot();
  const incidentStore = useIncidentsSnapshot();
  const auditEntries = useAuditEntries();

  const user = users.find((entry) => entry.id === userId) ?? null;

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [draftRole, setDraftRole] = useState<AdministrationAccessRole>("Analyst");
  const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);
  const [draftTeamIds, setDraftTeamIds] = useState<string[]>([]);
  const [mfaConfirmOpen, setMfaConfirmOpen] = useState(false);
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  const teams = useMemo(
    () => (user ? getAdministrationTeams(user.teamIds) : []),
    [user],
  );

  const sessions = useMemo(
    () => (user ? getAdminDemoSessions(user) : []),
    [user],
  );

  const assignedAlerts = useMemo(() => {
    if (!user) return [];
    return Array.from(alertStore.values())
      .filter(
        (alert) =>
          alert.assigneeId === user.id &&
          openAlertStatuses.includes(alert.status),
      )
      .sort(
        (a, b) =>
          alertSeverityWeight[a.severity] - alertSeverityWeight[b.severity],
      )
      .slice(0, 8);
  }, [alertStore, user]);

  const assignedIncidents = useMemo(() => {
    if (!user) return [];
    return Array.from(incidentStore.values())
      .filter(
        (incident) =>
          incident.assigneeId === user.id &&
          openIncidentStatuses.includes(incident.status),
      )
      .sort(
        (a, b) =>
          incidentSeverityWeight[a.severity] -
          incidentSeverityWeight[b.severity],
      )
      .slice(0, 8);
  }, [incidentStore, user]);

  const userActivity = useMemo(() => {
    if (!user) return [];
    return auditEntries
      .filter(
        (entry) => entry.actorId === user.id || entry.targetId === user.id,
      )
      .slice(0, 12);
  }, [auditEntries, user]);

  if (!user) {
    notFound();
  }

  const isOwner = user.role === "Owner";
  const privileged = isAdministrationPrivilegedRole(user.role);

  const openRoleDialog = () => {
    setDraftRole(user.role);
    setRoleDialogOpen(true);
  };

  const openTeamsDialog = () => {
    setDraftTeamIds(user.teamIds);
    setTeamsDialogOpen(true);
  };

  const saveRole = () => {
    updateUserRole(user.id, draftRole);
    toast({
      title: "Role updated",
      description: `${user.name} is now a ${draftRole}.`,
    });
    setRoleDialogOpen(false);
  };

  const saveTeams = () => {
    updateUserTeams(user.id, draftTeamIds);
    const teamNames = getAdministrationTeams(draftTeamIds)
      .map((team) => team.name)
      .join(", ");
    toast({
      title: "Teams updated",
      description:
        draftTeamIds.length > 0
          ? `${user.name} assigned to ${teamNames}.`
          : `${user.name} has no teams assigned.`,
    });
    setTeamsDialogOpen(false);
  };

  const confirmResetMfa = () => {
    resetUserMfa(user.id);
    toast({
      title: "MFA reset",
      description: `${user.name} must re-enroll MFA on next sign-in.`,
    });
    setMfaConfirmOpen(false);
  };

  const confirmSuspend = () => {
    suspendUsers([user.id]);
    toast({
      title: "User suspended",
      description: `${user.name} can no longer sign in.`,
      variant: "destructive",
    });
    setSuspendConfirmOpen(false);
  };

  const confirmRemoveAccess = () => {
    removeUserAccess(user.id);
    toast({
      title: "Access removed",
      description: `${user.name} can no longer access the workspace.`,
      variant: "destructive",
    });
    setRemoveConfirmOpen(false);
    router.push("/administration/users");
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/administration/users"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            User Management
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{user.name}</span>
        </div>

        <section className="bg-card rounded-lg border p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <Avatar className="size-14">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {getAdministrationInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="border-background absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2"
                  style={{
                    backgroundColor: administrationStatusColors[user.status],
                  }}
                >
                  <span className="sr-only">{statusLabels[user.status]}</span>
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight">
                    {user.name}
                  </h1>
                  <Badge variant="secondary" className="rounded-full">
                    {user.role}
                  </Badge>
                  {privileged ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    >
                      Privileged
                    </Badge>
                  ) : null}
                  {user.suspended ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-destructive/40 bg-destructive/10 text-destructive"
                    >
                      Suspended
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {user.title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {user.email}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {socJobRoleLabels[user.jobRole]} · {statusLabels[user.status]}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={openRoleDialog}
              >
                <Shield className="size-3.5" />
                Change role
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={openTeamsDialog}
              >
                <Users className="size-3.5" />
                Assign teams
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => setMfaConfirmOpen(true)}
              >
                <ShieldCheck className="size-3.5" />
                Reset MFA
              </Button>
            </div>
          </div>
        </section>

        <ProfileSection
          id="account"
          title="Account"
          description="Access role, job persona, and team membership."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Access role</FieldLabel>
              <p className="mt-1 text-sm">{user.role}</p>
            </div>
            <div>
              <FieldLabel>Job role</FieldLabel>
              <p className="mt-1 text-sm">{socJobRoleLabels[user.jobRole]}</p>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Teams</FieldLabel>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <Badge
                      key={team.id}
                      variant="outline"
                      className="rounded-full font-normal"
                    >
                      {team.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">None assigned</p>
                )}
              </div>
            </div>
            <div>
              <FieldLabel>Joined</FieldLabel>
              <p className="mt-1 text-sm">{user.joinedDate}</p>
            </div>
            <div>
              <FieldLabel>Last active</FieldLabel>
              <p className="mt-1 text-sm">{user.lastActiveLabel}</p>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          id="security"
          title="Security"
          description="Authentication posture and signed-in devices."
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <FieldLabel>Multi-factor authentication</FieldLabel>
                <p
                  className={cn(
                    "mt-1 inline-flex items-center gap-1.5 text-sm font-medium",
                    user.twoFactorEnabled
                      ? "text-green-600 dark:text-green-500"
                      : "text-destructive dark:text-red-400",
                  )}
                >
                  {user.twoFactorEnabled ? (
                    <ShieldCheck className="size-3.5" />
                  ) : (
                    <CircleX className="size-3.5" />
                  )}
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              {!user.twoFactorEnabled ? (
                <div className="border-destructive/30 bg-destructive/5 text-destructive flex max-w-sm items-start gap-2 rounded-md border px-3 py-2 text-sm">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                  <span>
                    MFA is off
                    {privileged
                      ? " for a privileged account — require enrollment before elevated actions."
                      : " — require enrollment before granting broader access."}
                  </span>
                </div>
              ) : null}
            </div>

            <div>
              <FieldLabel>Active sessions</FieldLabel>
              <div className="mt-2 overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Last active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
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
                                  Current
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          id="workload"
          title="Workload"
          description="Open alerts and incidents currently assigned to this member."
        >
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Open alerts</h3>
                <span className="text-muted-foreground text-xs">
                  {assignedAlerts.length} assigned
                </span>
              </div>
              {assignedAlerts.length === 0 ? (
                <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-center text-sm">
                  No open alerts assigned.
                </p>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alert</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Severity
                        </TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <Link
                              href={`/alerts/${alert.id}`}
                              className="hover:text-foreground text-sm font-medium transition-colors"
                            >
                              {alert.title}
                            </Link>
                            <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                              {alert.id}
                            </p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <SeverityBadge severity={alert.severity} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={alert.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Open incidents</h3>
                <span className="text-muted-foreground text-xs">
                  {assignedIncidents.length} assigned
                </span>
              </div>
              {assignedIncidents.length === 0 ? (
                <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-center text-sm">
                  No open incidents assigned.
                </p>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Incident</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Severity
                        </TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedIncidents.map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell>
                            <Link
                              href={`/incidents/${incident.id}`}
                              className="hover:text-foreground text-sm font-medium transition-colors"
                            >
                              {incident.title}
                            </Link>
                            <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                              {incident.id}
                              {incident.priority ? ` · ${incident.priority}` : ""}
                            </p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <IncidentSeverityBadge
                              severity={incident.severity}
                            />
                          </TableCell>
                          <TableCell>
                            <IncidentStatusBadge status={incident.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          id="activity"
          title="Recent activity"
          description="Audit events where this member is the actor or target."
        >
          {userActivity.length === 0 ? (
            <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-center text-sm">
              No recent audit activity for this member.
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivity.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                        {formatAuditTime(entry.at)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-mono text-xs">{entry.action}</p>
                          <p className="text-muted-foreground text-xs">
                            {entry.actorId === user.id ? "As actor" : "As target"}{" "}
                            · {entry.targetType}/{entry.targetId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                        {entry.detail}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ProfileSection>

        <ProfileSection
          id="danger"
          title="Danger zone"
          description="Suspend or permanently remove workspace access."
          className="border-destructive/30"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:text-destructive h-9 gap-1.5"
              disabled={isOwner || Boolean(user.suspended)}
              onClick={() => setSuspendConfirmOpen(true)}
            >
              <UserX className="size-3.5" />
              {user.suspended ? "Already suspended" : "Suspend user"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-9 gap-1.5"
              disabled={isOwner}
              onClick={() => setRemoveConfirmOpen(true)}
            >
              <UserX className="size-3.5" />
              Remove access
            </Button>
          </div>
          {isOwner ? (
            <p className="text-muted-foreground mt-3 text-xs">
              Owner accounts cannot be suspended or removed from this view.
            </p>
          ) : null}
        </ProfileSection>

        <div>
          <Button asChild variant="outline">
            <Link href="/administration/users">Back to users</Link>
          </Button>
        </div>
      </div>

      <ChangeRoleDialog
        open={roleDialogOpen}
        user={user}
        role={draftRole}
        onRoleChange={setDraftRole}
        onOpenChange={setRoleDialogOpen}
        onSubmit={saveRole}
      />

      <AssignTeamsDialog
        open={teamsDialogOpen}
        user={user}
        teamIds={draftTeamIds}
        onTeamIdsChange={setDraftTeamIds}
        onOpenChange={setTeamsDialogOpen}
        onSubmit={saveTeams}
      />

      <ConfirmDialog
        open={mfaConfirmOpen}
        onOpenChange={setMfaConfirmOpen}
        title="Reset MFA?"
        desc={`This will invalidate MFA factors for ${user.name} and require re-enrollment on the next sign-in.`}
        confirmText="Reset MFA"
        handleConfirm={confirmResetMfa}
      />

      <ConfirmDialog
        open={suspendConfirmOpen}
        onOpenChange={setSuspendConfirmOpen}
        title="Suspend user?"
        desc={`${user.name} will be signed out and blocked from accessing the workspace until restored.`}
        confirmText="Suspend"
        destructive
        handleConfirm={confirmSuspend}
      />

      <ConfirmDialog
        open={removeConfirmOpen}
        onOpenChange={setRemoveConfirmOpen}
        title="Remove access?"
        desc={`${user.name} will lose access to the security workspace immediately.`}
        confirmText="Remove access"
        destructive
        handleConfirm={confirmRemoveAccess}
      />
    </main>
  );
}
