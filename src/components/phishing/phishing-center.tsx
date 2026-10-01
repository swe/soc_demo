"use client";

import {
  Ban,
  Bell,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { tabTriggerClassName } from "@/components/alerts/alerts-primitives";
import { buildInvestigateHref } from "@/components/investigate/investigate-data";
import {
  buildPhishingHref,
  parsePhishingSearchParams,
  type PhishingTab,
} from "@/components/phishing/phishing-url";
import { RunPlaybookControl } from "@/components/playbooks/run-playbook-control";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { Panel, PanelHeading } from "@/components/soc/panel";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PHISH_CAMPAIGNS,
  PHISH_SOURCES,
  phishingApi,
  type PhishMessage,
  type PhishMessageStatus,
  type PhishRemediationAction,
  type PhishSource,
  type PhishVerdict,
  summarizePhishCampaigns,
} from "@/lib/mock-api/phishing";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const statusOptions: Array<PhishMessageStatus | "all"> = [
  "all",
  "new",
  "triaging",
  "remediating",
  "resolved",
  "false_positive",
];

const verdictOptions: Array<PhishVerdict | "all"> = [
  "all",
  "malicious",
  "suspicious",
  "bec_likely",
  "benign",
  "unknown",
];

const verdictSetOptions: PhishVerdict[] = [
  "malicious",
  "suspicious",
  "bec_likely",
  "benign",
  "unknown",
];

const PHISH_PLAYBOOK_ID = "proc-003";

const remediateActions: {
  action: PhishRemediationAction;
  label: string;
  icon: typeof Trash2;
}[] = [
  { action: "purge", label: "Purge", icon: Trash2 },
  { action: "block_url", label: "Block URL", icon: Ban },
  { action: "revoke_oauth", label: "Revoke OAuth", icon: UserX },
  { action: "notify_user", label: "Notify user", icon: Bell },
  { action: "escalate_bec", label: "Escalate BEC", icon: ShieldAlert },
];

function verdictTone(verdict: PhishVerdict) {
  switch (verdict) {
    case "malicious":
    case "bec_likely":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "suspicious":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "benign":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    default:
      return "";
  }
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sourceLabel(source: PhishSource) {
  return source.replaceAll("_", " ");
}

export function PhishingCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFilters = useMemo(
    () => parsePhishingSearchParams(searchParams),
    [searchParams],
  );

  const [allMessages, setAllMessages] = useState<PhishMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PhishingTab>(urlFilters.tab);
  const [searchQuery, setSearchQuery] = useState(urlFilters.search);
  const [status, setStatus] = useState(urlFilters.status);
  const [verdict, setVerdict] = useState(urlFilters.verdict);
  const [source, setSource] = useState(urlFilters.source);
  const [becOnly, setBecOnly] = useState(urlFilters.becOnly);
  const [campaignFilter, setCampaignFilter] = useState(urlFilters.campaignId);
  const [selectedId, setSelectedId] = useState<string | null>(
    urlFilters.messageId,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [verdictDraft, setVerdictDraft] = useState<PhishVerdict>("suspicious");
  const skipNextUrlSync = useRef(false);

  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    skipNextUrlSync.current = true;
    setTab(urlFilters.tab);
    setSearchQuery(urlFilters.search);
    setStatus(urlFilters.status);
    setVerdict(urlFilters.verdict);
    setSource(urlFilters.source);
    setBecOnly(urlFilters.becOnly);
    setCampaignFilter(urlFilters.campaignId);
    setSelectedId(urlFilters.messageId);
  }, [urlFilters]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await phishingApi.list({
        q: deferredSearch || undefined,
        status: status === "all" ? undefined : status,
        verdict: verdict === "all" ? undefined : verdict,
        source: source === "all" ? undefined : source,
        becOnly: becOnly || undefined,
      });
      setAllMessages(result.items);
    } catch (error) {
      toast({
        title: "Phishing queue failed",
        description:
          error instanceof Error ? error.message : "Unable to list messages",
        variant: "destructive",
      });
      setAllMessages([]);
    } finally {
      setLoading(false);
    }
  }, [deferredSearch, status, verdict, source, becOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [deferredSearch, status, verdict, source, becOnly, campaignFilter]);

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    const nextHref = buildPhishingHref({
      tab,
      search: deferredSearch,
      status,
      verdict,
      source,
      campaignId: campaignFilter,
      becOnly,
      messageId: selectedId,
    });
    const currentHref = buildPhishingHref(
      parsePhishingSearchParams(searchParams),
    );
    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [
    tab,
    deferredSearch,
    status,
    verdict,
    source,
    campaignFilter,
    becOnly,
    selectedId,
    router,
    searchParams,
  ]);

  const campaigns = useMemo(
    () => summarizePhishCampaigns(allMessages),
    [allMessages],
  );

  const messages = useMemo(() => {
    if (campaignFilter === "all") return allMessages;
    return allMessages.filter((m) => m.campaignId === campaignFilter);
  }, [allMessages, campaignFilter]);

  const openQueueForCampaign = (campaignId: string) => {
    setCampaignFilter(campaignId);
    setTab("queue");
  };

  const stats: SocStat[] = useMemo(() => {
    const open = allMessages.filter(
      (m) =>
        m.status === "new" ||
        m.status === "triaging" ||
        m.status === "remediating",
    ).length;
    const bec = allMessages.filter((m) => m.isBec).length;
    const malicious = allMessages.filter(
      (m) => m.verdict === "malicious" || m.verdict === "bec_likely",
    ).length;
    return [
      {
        key: "queue",
        title: "Queue",
        value: String(allMessages.length),
        context: "Messages in view",
        delta: 4.2,
        preferLower: true,
        hideDelta: true,
      },
      {
        key: "open",
        title: "Open",
        value: String(open),
        context: "New / triaging / remediating",
        delta: 2.1,
        preferLower: true,
      },
      {
        key: "malicious",
        title: "Malicious / BEC",
        value: String(malicious),
        context: "High-confidence verdicts",
        delta: 5.4,
        preferLower: true,
      },
      {
        key: "campaigns",
        title: "Campaigns",
        value: String(campaigns.length),
        context: "Grouped attack clusters",
        delta: 1.0,
        preferLower: true,
        hideDelta: true,
      },
      {
        key: "bec",
        title: "BEC flagged",
        value: String(bec),
        context: "Business email compromise",
        delta: 3.3,
        preferLower: true,
      },
    ];
  }, [allMessages, campaigns.length]);

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId],
  );

  useEffect(() => {
    if (selected) setVerdictDraft(selected.verdict);
  }, [selected]);

  const allPageSelected =
    messages.length > 0 && messages.every((m) => selectedIds.has(m.id));
  const somePageSelected =
    messages.some((m) => selectedIds.has(m.id)) && !allPageSelected;

  const upsertMessage = (message: PhishMessage) => {
    setAllMessages((prev) =>
      prev.map((row) => (row.id === message.id ? message : row)),
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const m of messages) next.delete(m.id);
      } else {
        for (const m of messages) next.add(m.id);
      }
      return next;
    });
  };

  const remediate = async (
    messageId: string,
    action: PhishRemediationAction,
  ) => {
    setBusyAction(`${messageId}:${action}`);
    try {
      const { message, receipt } = await phishingApi.remediate(
        messageId,
        action,
      );
      upsertMessage(message);
      toast({ title: "Remediation queued", description: receipt.message });
    } catch (error) {
      toast({
        title: "Remediation failed",
        description:
          error instanceof Error ? error.message : "Unable to remediate",
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const setAnalystVerdict = async (
    messageId: string,
    nextVerdict: PhishVerdict,
  ) => {
    setBusyAction(`${messageId}:verdict`);
    try {
      const { message, receipt } = await phishingApi.setVerdict(
        messageId,
        nextVerdict,
      );
      upsertMessage(message);
      toast({ title: "Verdict updated", description: receipt.message });
    } catch (error) {
      toast({
        title: "Verdict failed",
        description:
          error instanceof Error ? error.message : "Unable to set verdict",
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const openIncident = async (messageId: string) => {
    setBusyAction(`${messageId}:incident`);
    try {
      const { message, incident, receipt } =
        await phishingApi.openIncident(messageId);
      upsertMessage(message);
      toast({
        title: incident ? `Opened ${incident.id}` : "Incident link",
        description: receipt.message,
      });
    } catch (error) {
      toast({
        title: "Open incident failed",
        description:
          error instanceof Error ? error.message : "Unable to open incident",
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const bulkRemediate = async (action: PhishRemediationAction) => {
    if (selectedIds.size === 0) return;
    setBusyAction(`bulk:${action}`);
    try {
      const ids = Array.from(selectedIds);
      const results = await Promise.all(
        ids.map((id) => phishingApi.remediate(id, action)),
      );
      setAllMessages((prev) => {
        const byId = new Map(results.map((r) => [r.message.id, r.message]));
        return prev.map((row) => byId.get(row.id) ?? row);
      });
      toast({
        title: "Bulk remediation queued",
        description: `${ids.length} message(s) · ${action.replaceAll("_", " ")}`,
      });
      setSelectedIds(new Set());
    } catch (error) {
      toast({
        title: "Bulk remediation failed",
        description:
          error instanceof Error ? error.message : "Unable to remediate",
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const bulkSetVerdict = async (nextVerdict: PhishVerdict) => {
    if (selectedIds.size === 0) return;
    setBusyAction(`bulk:verdict`);
    try {
      const ids = Array.from(selectedIds);
      const results = await Promise.all(
        ids.map((id) => phishingApi.setVerdict(id, nextVerdict)),
      );
      setAllMessages((prev) => {
        const byId = new Map(results.map((r) => [r.message.id, r.message]));
        return prev.map((row) => byId.get(row.id) ?? row);
      });
      toast({
        title: "Bulk verdict updated",
        description: `${ids.length} message(s) → ${nextVerdict.replaceAll("_", " ")}`,
      });
      setSelectedIds(new Set());
    } catch (error) {
      toast({
        title: "Bulk verdict failed",
        description:
          error instanceof Error ? error.message : "Unable to set verdict",
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const hasSelection = selectedIds.size > 0;

  return (
    <>
      <ModuleShell
        toolbar={
          <>
            <ModuleToolbarSearch>
              <InputGroup className="h-9 w-full lg:max-w-sm">
                <InputGroupAddon>
                  <Search className="text-muted-foreground size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search subject, from, to, id…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </ModuleToolbarSearch>
            <ModuleToolbarActions>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => void load()}
                disabled={loading}
              >
                <RefreshCw
                  className={cn("size-3.5", loading && "animate-spin")}
                />
                Refresh
              </Button>
            </ModuleToolbarActions>
          </>
        }
      >
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as PhishingTab)}
          className="flex flex-col gap-4"
        >
          <div className="overflow-x-auto border-b">
            <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
              <TabsTrigger value="overview" className={tabTriggerClassName}>
                Overview
              </TabsTrigger>
              <TabsTrigger value="queue" className={tabTriggerClassName}>
                Queue
                <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                  {messages.length.toLocaleString("en-US")}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0 space-y-4">
            <StatsStrip stats={stats} />
            <Panel>
              <PanelHeading
                title="Campaigns"
                description="Attack clusters in the current filter set. Open a row to jump into the queue."
              />
              {campaigns.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No campaign groupings in the current view.
                </p>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead className="text-right">Messages</TableHead>
                        <TableHead className="text-right">Open</TableHead>
                        <TableHead className="text-right">Malicious</TableHead>
                        <TableHead className="text-right">BEC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow
                          key={campaign.campaignId}
                          className="hover:bg-accent/40 cursor-pointer"
                          onClick={() =>
                            openQueueForCampaign(campaign.campaignId)
                          }
                        >
                          <TableCell>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {campaign.campaignName}
                              </p>
                              <p className="text-muted-foreground font-mono text-xs">
                                {campaign.campaignId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {campaign.count}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {campaign.open}
                          </TableCell>
                          <TableCell className="text-right">
                            {campaign.malicious > 0 ? (
                              <Badge
                                variant="outline"
                                className="border-destructive/30 bg-destructive/10 text-destructive rounded-full text-xs font-normal"
                              >
                                {campaign.malicious}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                0
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {campaign.bec}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="queue" className="mt-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as PhishMessageStatus | "all")
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "all"
                        ? "All statuses"
                        : option.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={verdict}
                onValueChange={(value) =>
                  setVerdict(value as PhishVerdict | "all")
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Verdict" />
                </SelectTrigger>
                <SelectContent>
                  {verdictOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "all"
                        ? "All verdicts"
                        : option.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={source}
                onValueChange={(value) =>
                  setSource(value as PhishSource | "all")
                }
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {PHISH_SOURCES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {sourceLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={campaignFilter}
                onValueChange={(value) => setCampaignFilter(value)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All campaigns</SelectItem>
                  {PHISH_CAMPAIGNS.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant={becOnly ? "default" : "outline"}
                onClick={() => setBecOnly((v) => !v)}
              >
                BEC only
              </Button>
              <Badge variant="secondary" className="rounded-full font-normal">
                {messages.length} message{messages.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <div className="bg-card overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  {hasSelection ? (
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 px-4">
                        <Checkbox
                          aria-label="Select all visible messages"
                          checked={
                            allPageSelected
                              ? true
                              : somePageSelected
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={toggleSelectAllPage}
                        />
                      </TableHead>
                      <TableHead colSpan={6}>
                        <div className="flex flex-wrap items-center gap-2 py-0.5">
                          <span className="text-foreground text-sm font-medium">
                            {selectedIds.size} selected
                          </span>
                          <div className="ml-auto flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              disabled={busyAction !== null}
                              onClick={() => void bulkRemediate("purge")}
                            >
                              <Trash2 className="size-3.5" />
                              Purge
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              disabled={busyAction !== null}
                              onClick={() => void bulkRemediate("escalate_bec")}
                            >
                              <ShieldAlert className="size-3.5" />
                              Escalate BEC
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              disabled={busyAction !== null}
                              onClick={() => void bulkSetVerdict("malicious")}
                            >
                              Mark malicious
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              disabled={busyAction !== null}
                              onClick={() => void bulkSetVerdict("benign")}
                            >
                              Mark benign
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => setSelectedIds(new Set())}
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                      </TableHead>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableHead className="w-12 px-4">
                        <Checkbox
                          aria-label="Select all visible messages"
                          checked={false}
                          onCheckedChange={toggleSelectAllPage}
                        />
                      </TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verdict</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {loading && messages.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground py-10 text-center"
                      >
                        <span className="inline-flex items-center gap-2 text-sm">
                          <Loader2 className="size-4 animate-spin" />
                          Loading queue…
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : messages.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground py-10 text-center text-sm"
                      >
                        No messages match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    messages.map((message) => {
                      const isSelected = selectedIds.has(message.id);
                      return (
                        <TableRow
                          key={message.id}
                          className={cn(
                            "hover:bg-accent/40 cursor-pointer",
                            isSelected && "bg-accent/30",
                          )}
                          onClick={() => setSelectedId(message.id)}
                        >
                          <TableCell
                            className="w-12 px-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              aria-label={`Select ${message.id}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(message.id)}
                            />
                          </TableCell>
                          <TableCell className="max-w-[240px]">
                            <div className="flex flex-col gap-1">
                              <span className="truncate font-medium">
                                {message.subject}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {message.isBec ? (
                                  <Badge
                                    variant="outline"
                                    className="rounded-full text-xs font-normal"
                                  >
                                    BEC
                                  </Badge>
                                ) : null}
                                {message.isVip ? (
                                  <Badge
                                    variant="secondary"
                                    className="rounded-full text-xs font-normal"
                                  >
                                    VIP
                                  </Badge>
                                ) : null}
                                <span className="text-muted-foreground font-mono text-xs">
                                  {message.id}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[160px]">
                            <span className="line-clamp-2 text-xs">
                              {message.campaignName}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate text-sm">
                            {message.from}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="rounded-full font-normal capitalize"
                            >
                              {message.status.replaceAll("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full font-normal capitalize",
                                verdictTone(message.verdict),
                              )}
                            >
                              {message.verdict.replaceAll("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right text-xs tabular-nums">
                            {formatWhen(message.receivedAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </ModuleShell>

      <Sheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <SheetHeader className="space-y-1 text-left">
                <SheetTitle className="pr-8 leading-snug">
                  {selected.subject}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {selected.id} · {sourceLabel(selected.source)} ·{" "}
                  {selected.campaignName}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4 pb-8">
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full font-normal capitalize",
                      verdictTone(selected.verdict),
                    )}
                  >
                    {selected.verdict.replaceAll("_", " ")} ·{" "}
                    {Math.round(selected.confidence * 100)}%
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full font-normal capitalize"
                  >
                    {selected.status.replaceAll("_", " ")}
                  </Badge>
                  {selected.isBec ? (
                    <Badge
                      variant="destructive"
                      className="rounded-full font-normal"
                    >
                      BEC
                    </Badge>
                  ) : null}
                </div>

                <section className="space-y-1.5 text-sm">
                  <p>
                    <span className="text-muted-foreground">From </span>
                    {selected.from}
                  </p>
                  <p>
                    <span className="text-muted-foreground">To </span>
                    {selected.to.join(", ")}
                  </p>
                  {selected.reportedBy ? (
                    <p>
                      <span className="text-muted-foreground">Reported by </span>
                      {selected.reportedBy}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground text-xs">
                    Campaign {selected.campaignName} · Received{" "}
                    {formatWhen(selected.receivedAt)}
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Linked cases
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.alertId ? (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                      >
                        <Link href={`/alerts/${selected.alertId}`}>
                          Alert {selected.alertId}
                          <ExternalLink className="size-3" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No linked alert
                      </span>
                    )}
                    {selected.incidentId ? (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                      >
                        <Link href={`/incidents/${selected.incidentId}`}>
                          Incident {selected.incidentId}
                          <ExternalLink className="size-3" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1.5"
                        disabled={busyAction !== null}
                        onClick={() => void openIncident(selected.id)}
                      >
                        {busyAction === `${selected.id}:incident` ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <ShieldAlert className="size-3.5" />
                        )}
                        Open incident
                      </Button>
                    )}
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Analyst verdict
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={verdictDraft}
                      onValueChange={(value) =>
                        setVerdictDraft(value as PhishVerdict)
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {verdictSetOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        busyAction !== null ||
                        verdictDraft === selected.verdict
                      }
                      onClick={() =>
                        void setAnalystVerdict(selected.id, verdictDraft)
                      }
                    >
                      {busyAction === `${selected.id}:verdict` ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : null}
                      Apply verdict
                    </Button>
                  </div>
                </section>

                <section>
                  <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                    Headers
                  </h3>
                  <pre className="bg-muted/40 max-h-36 overflow-auto rounded-md border p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {selected.headersPreview}
                  </pre>
                </section>

                <section>
                  <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                    URLs
                  </h3>
                  {selected.urls.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No URLs</p>
                  ) : (
                    <ul className="space-y-2">
                      {selected.urls.map((url) => (
                        <li
                          key={url.url}
                          className="rounded-md border px-3 py-2 text-xs"
                        >
                          <p className="break-all font-mono">{url.url}</p>
                          <p className="text-muted-foreground mt-1">
                            {url.provider} · {url.verdict} ·{" "}
                            {Math.round(url.score * 100)}%
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs"
                            >
                              <Link
                                href={buildInvestigateHref(
                                  `url:"${url.url}"`,
                                )}
                              >
                                Investigate
                                <ExternalLink className="size-3" />
                              </Link>
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs"
                            >
                              <Link href="/threat-intelligence">
                                Indicators
                                <ExternalLink className="size-3" />
                              </Link>
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                    Attachments
                  </h3>
                  {selected.attachments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No attachments
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {selected.attachments.map((att) => (
                        <li
                          key={att.sha256}
                          className="rounded-md border px-3 py-2 text-xs"
                        >
                          <p className="font-medium">{att.name}</p>
                          <p className="text-muted-foreground mt-0.5 font-mono break-all">
                            {att.sha256}
                          </p>
                          <p className="text-muted-foreground mt-1 capitalize">
                            {att.verdict}
                            {att.malwareFamily ? ` · ${att.malwareFamily}` : ""}
                            {att.sandboxProvider
                              ? ` · ${att.sandboxProvider}`
                              : ""}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs"
                            >
                              <Link
                                href={buildInvestigateHref(
                                  `hash:${att.sha256}`,
                                )}
                              >
                                Investigate
                                <ExternalLink className="size-3" />
                              </Link>
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs"
                            >
                              <Link href="/threat-intelligence">
                                Indicators
                                <ExternalLink className="size-3" />
                              </Link>
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="space-y-2">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Playbook
                  </h3>
                  <RunPlaybookControl
                    preferredPlaybookId={PHISH_PLAYBOOK_ID}
                    alertId={selected.alertId}
                    incidentId={selected.incidentId}
                    compact
                  />
                </section>

                <section>
                  <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                    Remediate
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {remediateActions.map(({ action, label, icon: Icon }) => {
                      const key = `${selected.id}:${action}`;
                      return (
                        <Button
                          key={action}
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          disabled={busyAction !== null}
                          onClick={() => void remediate(selected.id, action)}
                        >
                          {busyAction === key ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Icon className="size-3.5" />
                          )}
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
