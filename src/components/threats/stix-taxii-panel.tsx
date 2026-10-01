"use client";

import { FileJson, RefreshCw, Search, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Panel, PanelHeading } from "@/components/soc/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type TaxiiCollection, tiApi } from "@/lib/mock-api/ti";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const statusTone: Record<TaxiiCollection["status"], string> = {
  healthy:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  degraded:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  paused: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

export function StixTaxiiPanel() {
  const [busy, setBusy] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [collections, setCollections] = useState<TaxiiCollection[]>([]);
  const [suggest, setSuggest] = useState<{
    query: string;
    sourceIds?: string[];
  } | null>(null);

  const refresh = useCallback(async () => {
    const { items } = await tiApi.listTaxiiCollections();
    setCollections(items);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const importBundle = async () => {
    setBusy(true);
    try {
      const { receipt, indicators } = await tiApi.importStixBundle();
      toast({
        title: "STIX bundle imported",
        description: `${receipt.message} · ${indicators.length} IOCs · ${receipt.id}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const syncCollection = async (collectionId: string) => {
    setSyncingId(collectionId);
    try {
      const result = await tiApi.syncTaxiiCollection(collectionId);
      await refresh();
      toast({
        title:
          result.receipt.outcome === "ok" ? "TAXII sync complete" : "Sync failed",
        description: `${result.receipt.message} · ${result.receipt.id}`,
        variant: result.receipt.outcome === "failed" ? "destructive" : undefined,
      });
      if (result.suggestInvestigateQuery) {
        setSuggest({
          query: result.suggestInvestigateQuery,
          sourceIds: result.suggestSourceIds,
        });
      }
    } finally {
      setSyncingId(null);
    }
  };

  const investigateHref = suggest
    ? `/investigate?q=${encodeURIComponent(suggest.query)}${
        suggest.sourceIds?.length
          ? `&sources=${encodeURIComponent(suggest.sourceIds.join(","))}`
          : ""
      }`
    : null;

  return (
    <Panel>
      <PanelHeading
        title="STIX / TAXII"
        description="Import STIX bundles into Indicators and sync TAXII 2.1 collections"
        action={
          <Button
            size="sm"
            className="gap-1.5"
            disabled={busy}
            onClick={() => void importBundle()}
          >
            <Upload className="size-3.5" />
            Import STIX bundle
          </Button>
        }
      />

      {suggest && investigateHref ? (
        <div className="bg-muted/40 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2">
          <p className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
            Suggested Investigate ·{" "}
            <span className="text-foreground font-mono">{suggest.query}</span>
          </p>
          <Button asChild size="sm" variant="secondary" className="h-7 gap-1.5">
            <Link href={investigateHref}>
              <Search className="size-3.5" />
              Open in Investigate
            </Link>
          </Button>
        </div>
      ) : null}

      <ul className="grid gap-2 sm:grid-cols-2">
        {collections.map((collection) => (
          <li
            key={collection.id}
            className="flex items-start gap-3 rounded-md border px-3 py-2.5"
          >
            <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
              <FileJson className="text-muted-foreground size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{collection.title}</p>
                <Badge
                  variant="outline"
                  className={cn("capitalize", statusTone[collection.status])}
                >
                  {collection.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                {collection.description}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {collection.objects.toLocaleString()} objects · last poll{" "}
                {collection.lastPollLabel}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 gap-1.5 text-xs"
                disabled={syncingId === collection.id}
                onClick={() => void syncCollection(collection.id)}
              >
                <RefreshCw
                  className={cn(
                    "size-3",
                    syncingId === collection.id && "animate-spin",
                  )}
                />
                {syncingId === collection.id ? "Syncing…" : "Sync"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
