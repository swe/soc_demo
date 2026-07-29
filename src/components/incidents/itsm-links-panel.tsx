"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  itsmApi,
  type ItsmProvider,
  type ItsmTicketLink,
} from "@/lib/mock-api/itsm";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const providerLabels: Record<ItsmProvider, string> = {
  servicenow: "ServiceNow",
  jira: "Jira",
};

function statusTone(status: ItsmTicketLink["status"]) {
  switch (status) {
    case "resolved":
    case "closed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "in_progress":
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400";
    default:
      return "";
  }
}

export function ItsmLinksPanel({
  incidentId,
  className,
}: {
  incidentId: string;
  className?: string;
}) {
  const [links, setLinks] = useState<ItsmTicketLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await itsmApi.listLinks(incidentId);
      setLinks(result.items);
    } catch (error) {
      toast({
        title: "ITSM load failed",
        description:
          error instanceof Error ? error.message : "Unable to list ticket links",
        variant: "destructive",
      });
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (provider: ItsmProvider) => {
    setBusyKey(`create-${provider}`);
    try {
      const { receipt } = await itsmApi.create({ incidentId, provider });
      toast({ title: "Ticket created", description: receipt.message });
      await load();
    } catch (error) {
      toast({
        title: "Create failed",
        description: error instanceof Error ? error.message : "Unable to create",
        variant: "destructive",
      });
    } finally {
      setBusyKey(null);
    }
  };

  const sync = async (linkId: string, direction: "push" | "pull") => {
    setBusyKey(`${direction}-${linkId}`);
    try {
      const result =
        direction === "push"
          ? await itsmApi.syncPush(linkId)
          : await itsmApi.syncPull(linkId);
      toast({
        title: direction === "push" ? "Pushed" : "Pulled",
        description: result.receipt.message,
      });
      await load();
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Unable to sync",
        variant: "destructive",
      });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <section className={cn("bg-card rounded-lg border p-4", className)}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            ITSM links
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Bi-directional ServiceNow / Jira ticket sync.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            disabled={busyKey !== null}
            onClick={() => void create("servicenow")}
          >
            {busyKey === "create-servicenow" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Plus className="size-3" />
            )}
            ServiceNow
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            disabled={busyKey !== null}
            onClick={() => void create("jira")}
          >
            {busyKey === "create-jira" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Plus className="size-3" />
            )}
            Jira
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {loading && links.length === 0 ? (
        <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading ITSM links…
        </div>
      ) : links.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-sm">
          No external tickets linked yet.
        </p>
      ) : (
        <ul className="divide-border/70 divide-y">
          {links.map((link) => (
            <li key={link.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="rounded-full font-normal">
                      {providerLabels[link.provider]}
                    </Badge>
                    <a
                      href={link.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-sm font-medium hover:underline"
                    >
                      {link.externalKey}
                      <ExternalLink className="size-3" />
                    </a>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full font-normal capitalize",
                        statusTone(link.status),
                      )}
                    >
                      {link.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1.5 text-xs">
                    Last {link.lastSyncDirection} ·{" "}
                    {new Date(link.lastSyncAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={busyKey !== null}
                    onClick={() => void sync(link.id, "push")}
                  >
                    {busyKey === `push-${link.id}` ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <ArrowUpFromLine className="size-3" />
                    )}
                    Push
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={busyKey !== null}
                    onClick={() => void sync(link.id, "pull")}
                  >
                    {busyKey === `pull-${link.id}` ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <ArrowDownToLine className="size-3" />
                    )}
                    Pull
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
