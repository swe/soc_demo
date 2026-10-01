"use client";

import { Bell, Phone, Radio } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { Panel, PanelHeading } from "@/components/soc/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getOnCallScheduleSnapshot,
  onCallApi,
  subscribeOnCall,
} from "@/lib/mock-api/on-call";
import { toast } from "@/lib/toast";

export function PagerDutyOnCallPanel() {
  const schedule = useSyncExternalStore(
    subscribeOnCall,
    getOnCallScheduleSnapshot,
    getOnCallScheduleSnapshot,
  );
  const [paging, setPaging] = useState(false);

  const pageOnCall = async () => {
    setPaging(true);
    try {
      const { receipt } = await onCallApi.page({
        summary: "Page from Overview — analyst requested escalation",
        severity: "high",
      });
      toast({
        title: "Paged on-call",
        description: `${receipt.message} · ${receipt.externalRef ?? receipt.id}`,
      });
    } catch (error) {
      toast({
        title: "Page failed",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setPaging(false);
    }
  };

  return (
    <Panel>
      <PanelHeading
        title="PagerDuty on-call"
        description={`${schedule.name} · ${schedule.openPages} open pages`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="default"
              className="gap-1.5"
              disabled={paging}
              onClick={() => void pageOnCall()}
            >
              <Radio className="size-3.5" />
              {paging ? "Paging…" : "Page on-call"}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/on-call" className="gap-1.5">
                <Phone className="size-3.5" />
                On-call desk
              </Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="bg-muted/50 min-w-0 rounded-lg px-3 py-2.5">
          <p className="text-muted-foreground text-xs">Primary</p>
          <p className="text-sm font-medium">{schedule.primary.name}</p>
          <p className="text-muted-foreground text-xs">
            until {schedule.primary.until}
            {schedule.primary.title ? ` · ${schedule.primary.title}` : ""}
          </p>
        </div>
        <div className="bg-muted/50 min-w-0 rounded-lg px-3 py-2.5">
          <p className="text-muted-foreground text-xs">Secondary</p>
          <p className="text-sm font-medium">{schedule.secondary.name}</p>
          <p className="text-muted-foreground text-xs">
            until {schedule.secondary.until}
            {schedule.secondary.title ? ` · ${schedule.secondary.title}` : ""}
          </p>
        </div>
        <div className="bg-muted/50 min-w-0 rounded-lg px-3 py-2.5">
          <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
            <Bell className="size-3.5" />
            Last escalation
          </p>
          <p className="text-xs leading-relaxed">
            {schedule.lastEscalation ?? "No pages yet this shift"}
          </p>
          <Badge variant="muted" className="mt-2">
            {schedule.openPages} open pages
          </Badge>
        </div>
      </div>
    </Panel>
  );
}
