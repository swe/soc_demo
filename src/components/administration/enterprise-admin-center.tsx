"use client";

import { KeyRound, ShieldAlert, Timer, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ModuleShell } from "@/components/soc/module-shell";
import {
  ModuleTabsList,
  ModuleTabsTrigger,
  TabCount,
} from "@/components/soc/module-tabs";
import { Panel, PanelHeading } from "@/components/soc/panel";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  adminEnterpriseApi,
  type BreakGlassSession,
  type EnterpriseApiKey,
  type RetentionPolicy,
  type ScimStatus,
} from "@/lib/mock-api/admin-enterprise";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function EnterpriseAdminCenter() {
  const [tab, setTab] = useState("retention");
  const [retention, setRetention] = useState<RetentionPolicy[]>([]);
  const [apiKeys, setApiKeys] = useState<EnterpriseApiKey[]>([]);
  const [scim, setScim] = useState<ScimStatus | null>(null);
  const [breakGlass, setBreakGlass] = useState<BreakGlassSession[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [ret, keys, scimStatus, sessions] = await Promise.all([
      adminEnterpriseApi.listRetention(),
      adminEnterpriseApi.listApiKeys(),
      adminEnterpriseApi.getScim(),
      adminEnterpriseApi.listBreakGlass(),
    ]);
    setRetention(ret);
    setApiKeys(keys);
    setScim(scimStatus);
    setBreakGlass(sessions);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stripStats: SocStat[] = useMemo(() => {
    const activeBreakGlass = breakGlass.filter(
      (session) => session.status === "active",
    ).length;
    return [
      {
        key: "retention",
        title: "Retention policies",
        value: String(retention.length),
        context: "Hot / cold tiers",
      },
      {
        key: "keys",
        title: "API keys",
        value: String(apiKeys.length),
        context: "Active credentials",
      },
      {
        key: "scim",
        title: "SCIM users",
        value: scim ? String(scim.usersSynced) : "—",
        context: scim ? `${scim.provider} · ${scim.status}` : "Not loaded",
      },
      {
        key: "break-glass",
        title: "Break-glass",
        value: String(activeBreakGlass),
        context: "Active elevated sessions",
      },
    ] satisfies SocStat[];
  }, [retention, apiKeys, scim, breakGlass]);

  const saveRetention = async (policyId: string) => {
    setBusy(`ret-${policyId}`);
    try {
      const { receipt, policy } =
        await adminEnterpriseApi.saveRetention(policyId);
      await refresh();
      toast({
        title: "Retention saved",
        description: `${policy?.name ?? policyId} · ${receipt.id}`,
      });
    } finally {
      setBusy(null);
    }
  };

  const mintKey = async () => {
    setBusy("mint");
    try {
      const { receipt, key } = await adminEnterpriseApi.mintApiKey();
      await refresh();
      toast({
        title: "API key minted",
        description: `${key.prefix} · ${receipt.id}`,
      });
    } finally {
      setBusy(null);
    }
  };

  const revokeKey = async (keyId: string) => {
    setBusy(`revoke-${keyId}`);
    try {
      const { receipt, key } = await adminEnterpriseApi.revokeApiKey(keyId);
      await refresh();
      toast({
        title: key ? "API key revoked" : "Revoke failed",
        description: `${receipt.message} · ${receipt.id}`,
        variant: receipt.outcome === "failed" ? "destructive" : undefined,
      });
    } finally {
      setBusy(null);
    }
  };

  const refreshScim = async () => {
    setBusy("scim");
    try {
      const { receipt, status } = await adminEnterpriseApi.refreshScim();
      setScim(status);
      toast({
        title: "SCIM refreshed",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } finally {
      setBusy(null);
    }
  };

  const startBreakGlass = async () => {
    setBusy("bg-start");
    try {
      const { receipt, session } = await adminEnterpriseApi.startBreakGlass();
      await refresh();
      toast({
        title: "Break-glass started",
        description: `${session.actor} · ${receipt.id}`,
      });
    } finally {
      setBusy(null);
    }
  };

  const endBreakGlass = async (sessionId: string) => {
    setBusy(`bg-end-${sessionId}`);
    try {
      const { receipt } = await adminEnterpriseApi.endBreakGlass(sessionId);
      await refresh();
      toast({
        title: "Break-glass ended",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <ModuleShell>
      <StatsStrip stats={stripStats} />

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <ModuleTabsList>
          <ModuleTabsTrigger value="retention">Retention</ModuleTabsTrigger>
          <ModuleTabsTrigger value="api-keys">
            API keys
            <TabCount>{apiKeys.length}</TabCount>
          </ModuleTabsTrigger>
          <ModuleTabsTrigger value="scim">SCIM</ModuleTabsTrigger>
          <ModuleTabsTrigger value="break-glass">Break-glass</ModuleTabsTrigger>
        </ModuleTabsList>

        <TabsContent value="retention" className="space-y-3">
          {retention.map((policy) => (
            <Panel key={policy.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Timer className="text-muted-foreground mt-0.5 size-4" />
                  <div>
                    <p className="text-sm font-medium">{policy.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Hot {policy.retention} · Cold {policy.coldStorage}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === `ret-${policy.id}`}
                  onClick={() => void saveRetention(policy.id)}
                >
                  {busy === `ret-${policy.id}` ? "Saving…" : "Save"}
                </Button>
              </div>
            </Panel>
          ))}
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-3">
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={busy === "mint"}
              onClick={() => void mintKey()}
            >
              <KeyRound className="mr-1.5 size-3.5" />
              {busy === "mint" ? "Minting…" : "Mint key"}
            </Button>
          </div>
          {apiKeys.map((key) => (
            <Panel key={key.id}>
              <PanelHeading
                title={key.name}
                description={`${key.prefix} · last used ${key.lastUsed}`}
                action={
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={key.status === "active" ? "success" : "muted"}
                      className="capitalize"
                    >
                      {key.status}
                    </Badge>
                    {key.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={busy === `revoke-${key.id}`}
                        onClick={() => void revokeKey(key.id)}
                      >
                        Revoke
                      </Button>
                    ) : null}
                  </div>
                }
              />
              <div className="flex flex-wrap gap-1.5">
                {key.scopes.map((scope) => (
                  <Badge
                    key={scope}
                    variant="secondary"
                    className="font-mono text-xs"
                  >
                    {scope}
                  </Badge>
                ))}
              </div>
            </Panel>
          ))}
        </TabsContent>

        <TabsContent value="scim">
          {scim ? (
            <Panel>
              <PanelHeading
                title="SCIM provisioning"
                description={`${scim.provider} · SSO sync`}
                action={
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={scim.errors > 0 ? "warning" : "success"}
                      className="capitalize"
                    >
                      {scim.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === "scim"}
                      onClick={() => void refreshScim()}
                    >
                      {busy === "scim" ? "Refreshing…" : "Refresh"}
                    </Button>
                  </div>
                }
              />
              <div className="border-separator grid gap-3 border-t pt-4 sm:grid-cols-3 sm:gap-0">
                {(
                  [
                    {
                      key: "users",
                      title: "Users synced",
                      value: String(scim.usersSynced),
                      context: null as string | null,
                    },
                    {
                      key: "groups",
                      title: "Groups synced",
                      value: String(scim.groupsSynced),
                      context: null,
                    },
                    {
                      key: "last",
                      title: "Last sync",
                      value: scim.lastSync,
                      context: `${scim.errors} errors`,
                    },
                  ] as const
                ).map((metric, index) => (
                  <div
                    key={metric.key}
                    className={cn(
                      "space-y-1 py-1",
                      index > 0 &&
                        "sm:border-separator sm:border-l sm:pl-4 lg:pl-6",
                      index < 2 && "sm:pr-4 lg:pr-6",
                    )}
                  >
                    <p className="text-muted-foreground text-caption">
                      {metric.title}
                    </p>
                    <p
                      className={
                        metric.key === "last"
                          ? "text-sm font-medium"
                          : "text-title-3 font-semibold tabular-nums"
                      }
                    >
                      {metric.value}
                    </p>
                    {metric.context ? (
                      <p className="text-muted-foreground text-xs">
                        {metric.context}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}
        </TabsContent>

        <TabsContent value="break-glass" className="space-y-3">
          {breakGlass.map((session) => (
            <Panel key={session.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <ShieldAlert className="text-muted-foreground mt-0.5 size-4" />
                  <div>
                    <p className="text-sm font-medium">{session.actor}</p>
                    <p className="text-muted-foreground text-xs">
                      {session.reason}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {session.started} → {session.expires}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={session.status === "active" ? "warning" : "muted"}
                    className="capitalize"
                  >
                    {session.status}
                  </Badge>
                  {session.status === "active" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={busy === `bg-end-${session.id}`}
                      onClick={() => void endBreakGlass(session.id)}
                    >
                      End
                    </Button>
                  ) : null}
                </div>
              </div>
            </Panel>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={busy === "bg-start"}
            onClick={() => void startBreakGlass()}
          >
            <Users className="size-3.5" />
            {busy === "bg-start" ? "Starting…" : "Start break-glass"}
          </Button>
        </TabsContent>
      </Tabs>
    </ModuleShell>
  );
}
