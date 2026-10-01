"use client";

import {
  Bell,
  Bug,
  ClipboardCheck,
  Crosshair,
  type LucideIcon,
  Radar,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  type AlertSeverity,
  openAlertStatuses,
  socAlerts,
} from "@/components/alerts/alerts-data";
import { useSocRole } from "@/components/auth/soc-role-provider";
import {
  complianceFindings,
  complianceFrameworks,
} from "@/components/compliance/compliance-data";
import {
  getIncidentSlaState,
  openIncidentStatuses,
  socIncidents,
} from "@/components/incidents/incidents-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { vulnerabilities } from "@/components/vulnerabilities/vulnerabilities-data";
import { canAccessPath, type SocJobRole } from "@/lib/soc-roles";
import { cn } from "@/lib/utils";

type SocNotificationKind =
  | "alert"
  | "incident"
  | "vulnerability"
  | "compliance"
  | "intel";

type HeaderNotification = {
  id: string;
  kind: SocNotificationKind;
  title: string;
  description: string;
  time: string;
  read: boolean;
  href: string;
  severity?: AlertSeverity;
};

const kindMeta: Record<
  SocNotificationKind,
  { label: string; icon: LucideIcon; className: string }
> = {
  alert: {
    label: "Alert",
    icon: Radar,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  incident: {
    label: "Incident",
    icon: ShieldAlert,
    className: "bg-destructive/10 text-destructive-text",
  },
  vulnerability: {
    label: "Vuln",
    icon: Bug,
    className: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  compliance: {
    label: "Compliance",
    icon: ClipboardCheck,
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  intel: {
    label: "Intel",
    icon: Crosshair,
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
};

function ageToTimeLabel(ageMinutes: number): string {
  if (ageMinutes < 60) return `${ageMinutes}m ago`;
  if (ageMinutes < 60 * 24) return `${Math.round(ageMinutes / 60)}h ago`;
  return `${Math.round(ageMinutes / (60 * 24))}d ago`;
}

function buildNotificationsForRole(role: SocJobRole): HeaderNotification[] {
  const items: HeaderNotification[] = [];

  const canAlerts = canAccessPath(role, "/alerts");
  const canIncidents = canAccessPath(role, "/incidents");
  const canVulns =
    canAccessPath(role, "/vulnerabilities") ||
    canAccessPath(role, "/vulnerabilities/findings");
  const canCompliance = canAccessPath(role, "/compliance");
  const canIntel = canAccessPath(role, "/threat-intelligence");

  if (canAlerts) {
    const alertPool =
      role === "analyst_t1"
        ? socAlerts.filter(
            (a) =>
              openAlertStatuses.includes(a.status) &&
              (a.status === "new" || a.status === "triaging"),
          )
        : role === "analyst_t2" || role === "analyst_t3"
          ? socAlerts.filter(
              (a) =>
                openAlertStatuses.includes(a.status) &&
                (a.status === "investigating" ||
                  a.status === "escalated" ||
                  a.severity === "critical"),
            )
          : socAlerts.filter(
              (a) =>
                openAlertStatuses.includes(a.status) &&
                (a.severity === "critical" || a.severity === "high"),
            );

    for (const alert of alertPool.slice(0, 3)) {
      items.push({
        id: `alert-${alert.id}`,
        kind: "alert",
        title: alert.title,
        description: `${alert.id} · ${alert.entityName} · ${alert.status}`,
        time: ageToTimeLabel(alert.ageMinutes),
        read: alert.status !== "new",
        href: `/alerts/${alert.id}`,
        severity: alert.severity,
      });
    }
  }

  if (canIncidents) {
    const incidentPool =
      role === "soc_manager"
        ? socIncidents.filter((i) => {
            if (!openIncidentStatuses.includes(i.status)) return false;
            const sla = getIncidentSlaState(i);
            return (
              sla === "at-risk" || sla === "breached" || i.priority === "P1"
            );
          })
        : socIncidents.filter(
            (i) =>
              openIncidentStatuses.includes(i.status) &&
              (i.priority === "P1" || i.priority === "P2"),
          );

    for (const incident of incidentPool.slice(0, 2)) {
      items.push({
        id: `incident-${incident.id}`,
        kind: "incident",
        title: incident.title,
        description: `${incident.id} · ${incident.priority} · ${incident.entityName}`,
        time: ageToTimeLabel(incident.ageMinutes),
        read: false,
        href: `/incidents/${incident.id}`,
        severity:
          incident.priority === "P1"
            ? "critical"
            : incident.priority === "P2"
              ? "high"
              : "medium",
      });
    }
  }

  if (canVulns) {
    const vulnPool =
      role === "c_level" || role === "ciso"
        ? vulnerabilities.filter(
            (v) => v.exploitable && v.severity === "critical",
          )
        : role === "analyst_t3"
          ? vulnerabilities.filter(
              (v) =>
                v.zeroDay || (v.exploitable && v.linkedIncidentIds.length > 0),
            )
          : vulnerabilities.filter(
              (v) =>
                v.exploitable ||
                v.severity === "critical" ||
                v.linkedAlertIds.length > 0,
            );

    for (const vuln of vulnPool.slice(0, 2)) {
      items.push({
        id: `vuln-${vuln.id}`,
        kind: "vulnerability",
        title: vuln.title,
        description: `${vuln.cve} · priority ${vuln.socPriority} · ${vuln.exposedDeviceCount} assets`,
        time: vuln.updatedLabel,
        read: false,
        href: `/vulnerabilities/findings?id=${encodeURIComponent(vuln.id)}`,
        severity: vuln.severity,
      });
    }
  }

  if (
    canIntel &&
    (role === "ciso" || role === "analyst_t3" || role === "soc_manager")
  ) {
    items.push({
      id: "intel-indicators",
      kind: "intel",
      title: "Threat indicators updated",
      description: "Review new IOCs in the indicators workspace.",
      time: "1h ago",
      read: role !== "analyst_t3",
      href: "/threat-intelligence",
      severity: "medium",
    });
  }

  if (canCompliance) {
    const openFinding = complianceFindings.find(
      (f) => f.status !== "remediated" && f.status !== "accepted",
    );
    const nextFramework = complianceFrameworks.reduce((soonest, framework) =>
      framework.daysToMilestone < soonest.daysToMilestone ? framework : soonest,
    );

    if (openFinding) {
      items.push({
        id: `compliance-${openFinding.id}`,
        kind: "compliance",
        title: openFinding.title,
        description: `${openFinding.controlCode} · ${openFinding.severity} · ${openFinding.dueLabel}`,
        time: `${openFinding.ageDays}d ago`,
        read: false,
        href: "/compliance",
        severity: openFinding.severity,
      });
    }

    items.push({
      id: `framework-${nextFramework.id}`,
      kind: "compliance",
      title: `${nextFramework.shortName} milestone approaching`,
      description: `${nextFramework.name} · ${nextFramework.daysToMilestone}d remaining`,
      time: "Yesterday",
      read: true,
      href: "/compliance",
      severity: nextFramework.daysToMilestone < 30 ? "high" : "medium",
    });
  }

  // Prefer unread / newer first; keep a tight list.
  return items.sort((a, b) => Number(a.read) - Number(b.read)).slice(0, 8);
}

export function HeaderNotifications() {
  const router = useRouter();
  const { effectiveRole, hydrated } = useSocRole();
  const roleNotifications = React.useMemo(
    () => buildNotificationsForRole(effectiveRole),
    [effectiveRole],
  );
  const [readIds, setReadIds] = React.useState<Set<string>>(() => new Set());

  React.useEffect(() => {
    setReadIds(new Set());
  }, [effectiveRole]);

  const notifications = React.useMemo(
    () =>
      roleNotifications.map((n) => ({
        ...n,
        read: n.read || readIds.has(n.id),
      })),
    [roleNotifications, readIds],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markOneRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground relative"
          aria-label={
            unreadCount
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="size-4" aria-hidden="true" />
          {hydrated && unreadCount > 0 ? (
            <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[22rem] p-0 sm:w-96" align="end">
        <DropdownMenuLabel className="px-3 py-2.5 text-sm font-normal">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground shrink-0 text-xs font-medium underline-offset-4 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  markAllRead();
                }}
              >
                Mark all read
              </button>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[min(360px,55vh)]">
          <div className="flex flex-col py-1">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground px-3 py-6 text-sm">
                No notifications for this role.
              </p>
            ) : (
              notifications.map((n) => {
                const meta = kindMeta[n.kind];
                const Icon = meta.icon;
                return (
                  <DropdownMenuItem
                    key={n.id}
                    className={cn(
                      "focus:bg-accent cursor-pointer items-start gap-2.5 rounded-none px-3 py-2.5",
                      !n.read && "bg-accent/35",
                    )}
                    onSelect={() => {
                      markOneRead(n.id);
                      router.push(n.href);
                    }}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                        meta.className,
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-tight",
                            !n.read && "font-semibold",
                          )}
                        >
                          {n.title}
                        </p>
                        <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
                        {n.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-5 rounded-full px-1.5 text-xs font-medium",
                            meta.className,
                          )}
                        >
                          {meta.label}
                        </Badge>
                        {n.severity ? (
                          <Badge
                            variant={n.severity}
                            className="h-5 rounded-full px-1.5 text-xs font-medium capitalize"
                          >
                            {n.severity}
                          </Badge>
                        ) : null}
                        {!n.read ? (
                          <span className="bg-primary size-1.5 rounded-full" />
                        ) : null}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-end px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            asChild
          >
            <Link href="/profile/notifications">Preferences</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
