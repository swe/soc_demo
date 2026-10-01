"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { SocAlert } from "@/components/alerts/alerts-data";
import { useAlertsSessionStore } from "@/components/alerts/alerts-session";
import {
  type AssistChatApplyAction,
  type AssistChatContext,
  assistChatGreeting,
  type AssistChatMessage,
  type AssistChatPromptId,
  assistChatPrompts,
  buildAssistChatReply,
} from "@/components/assist/assist-chat-scripts";
import type { SocIncident } from "@/components/incidents/incidents-data";
import {
  getIncidentFromSession,
  patchIncidentsInSession,
} from "@/components/incidents/incidents-session";
import {
  runPlaybookAgainstIncident,
  runPlaybookFromAlert,
} from "@/components/playbooks/playbooks-session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AssistInvestigatePlan } from "@/lib/api-adapters/assist";
import { assistApi } from "@/lib/mock-api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export type AssistChatPanelProps = {
  alert?: SocAlert;
  incident?: SocIncident;
  investigateQuery?: string;
  onApplyNotes?: (notes: string) => void;
  className?: string;
  triggerClassName?: string;
  /** When true, render body only (for embedding in another sheet/tab). */
  embedded?: boolean;
  defaultOpen?: boolean;
  triggerLabel?: string;
};

function InvestigatePlanSnippet({
  plan,
  alert,
  incident,
  onApplyNotes,
}: {
  plan: AssistInvestigatePlan;
  alert?: SocAlert;
  incident?: SocIncident;
  onApplyNotes?: (notes: string) => void;
}) {
  const [busy, setBusy] = useState<"draft" | "contain" | null>(null);

  const applyDraft = async () => {
    setBusy("draft");
    try {
      const receipt = await assistApi.applyAttackStoryDraft({
        draft: plan.attackStoryDraft,
        alert,
        incident,
      });
      onApplyNotes?.(plan.attackStoryDraft);
      toast({
        title: "Attack Story draft applied",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } catch (error) {
      toast({
        title: "Apply draft failed",
        description:
          error instanceof Error ? error.message : "Unable to apply draft",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const runContain = async () => {
    if (plan.recommendedContain.length === 0) return;
    setBusy("contain");
    try {
      const { summary, receipts } = await assistApi.runRecommendedContain({
        recommendations: plan.recommendedContain,
        incident,
        alerts: alert ? [alert] : undefined,
      });
      const first = receipts[0];
      toast({
        title: "Recommended contain executed",
        description: first ? `${summary} · ${first.id}` : summary,
      });
    } catch (error) {
      toast({
        title: "Contain failed",
        description:
          error instanceof Error ? error.message : "Unable to run contain",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium">Multi-hop investigate</p>
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={busy !== null || !plan.attackStoryDraft}
            onClick={() => void applyDraft()}
          >
            {busy === "draft" ? "Applying…" : "Apply Attack Story draft"}
          </Button>
          {plan.recommendedContain.length > 0 ? (
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={busy !== null}
              onClick={() => void runContain()}
            >
              {busy === "contain" ? "Running…" : "Run recommended contain"}
            </Button>
          ) : null}
        </div>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {plan.summary}
      </p>
      <ol className="space-y-1.5">
        {plan.hops.map((hop, index) => (
          <li key={hop.id} className="text-xs">
            <span className="text-muted-foreground font-mono">
              {index + 1}.
            </span>{" "}
            <span className="font-medium">{hop.question}</span>
            <span className="text-muted-foreground">
              {" "}
              · {Math.round(hop.confidence * 100)}%
            </span>
            {hop.cites.length > 0 ? (
              <p className="text-muted-foreground mt-0.5 pl-4">
                Cites:{" "}
                {hop.cites.map((c) => `${c.kind}:${c.label}`).join(", ")}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      {plan.recommendedContain.length > 0 ? (
        <p className="text-muted-foreground text-xs">
          Contain:{" "}
          {plan.recommendedContain
            .map((a) => a.label ?? a.actionId)
            .join("; ")}
        </p>
      ) : null}
    </div>
  );
}

function MessageBubble({
  message,
  onApply,
}: {
  message: AssistChatMessage;
  onApply: (action: AssistChatApplyAction) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isUser ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[95%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60 border",
        )}
      >
        {message.content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code
                key={i}
                className="bg-background/50 rounded px-1 font-mono text-xs"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
      {message.actions && message.actions.length > 0 ? (
        <div className="flex max-w-[95%] flex-col gap-1.5">
          {typeof message.confidence === "number" ? (
            <Badge
              variant="secondary"
              className="w-fit rounded-full font-normal"
            >
              Confidence {message.confidence}%
            </Badge>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            {message.actions.map((action, index) => {
              if (action.type === "open_investigate") {
                return (
                  <Button
                    key={`${action.type}-${index}`}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    asChild
                  >
                    <Link
                      href={`/investigate?q=${encodeURIComponent(action.query)}`}
                    >
                      {action.label}
                    </Link>
                  </Button>
                );
              }
              return (
                <Button
                  key={`${action.type}-${index}`}
                  size="sm"
                  variant={action.type === "apply_all" ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => onApply(action)}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AssistChatBody({
  alert,
  incident,
  investigateQuery,
  onApplyNotes,
}: {
  alert?: SocAlert;
  incident?: SocIncident;
  investigateQuery?: string;
  onApplyNotes?: (notes: string) => void;
}) {
  const ctx = useMemo<AssistChatContext>(() => {
    if (alert) return { kind: "alert", alert };
    if (incident) return { kind: "incident", incident };
    return { kind: "investigate", investigateQuery };
  }, [alert, incident, investigateQuery]);

  const [messages, setMessages] = useState<AssistChatMessage[]>(() => [
    assistChatGreeting(ctx),
  ]);
  const [busy, setBusy] = useState(false);
  const [investigate, setInvestigate] = useState<AssistInvestigatePlan | null>(
    null,
  );
  const alertsSession = useAlertsSessionStore();

  useEffect(() => {
    let cancelled = false;
    if (!alert && !incident) {
      setInvestigate(null);
      return;
    }
    void (async () => {
      try {
        const result = alert
          ? await assistApi.triage({ kind: "alert", alert })
          : incident
            ? await assistApi.triage({ kind: "incident", incident })
            : null;
        if (!cancelled) {
          setInvestigate(result?.investigate ?? null);
        }
      } catch {
        if (!cancelled) setInvestigate(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [alert, incident]);

  const runPrompt = (promptId: AssistChatPromptId) => {
    setBusy(true);
    window.setTimeout(() => {
      const { user, assistant } = buildAssistChatReply(promptId, ctx);
      setMessages((prev) => [...prev, user, assistant]);
      setBusy(false);
    }, 280);
  };

  const onApply = (action: AssistChatApplyAction) => {
    switch (action.type) {
      case "apply_notes":
        onApplyNotes?.(action.notes);
        toast({
          title: "Notes applied",
          description: "Draft copied into the notes field.",
        });
        break;
      case "apply_all": {
        onApplyNotes?.(action.notes);
        if (alert && action.status) {
          alertsSession.patchAlerts([alert.id], {
            status: action.status,
            notes: alert.notes
              ? `${alert.notes}\n\n${action.notes}`
              : action.notes,
          });
        } else if (incident) {
          patchIncidentsInSession([incident.id], {
            notes: incident.notes
              ? `${incident.notes}\n\n${action.notes}`
              : action.notes,
          });
        }
        toast({
          title: "Assist applied",
          description: [
            `Notes${action.status ? ` + status → ${action.status}` : ""}`,
            action.playbookHint
              ? `· playbook hint ${action.playbookHint.playbookCode}`
              : null,
            `(${action.confidence}% confidence)`,
          ]
            .filter(Boolean)
            .join(" "),
        });
        break;
      }
      case "suggest_severity":
        if (alert) {
          toast({
            title: "Severity suggestion",
            description: `Recommend elevating ${alert.id} to ${action.severity.toUpperCase()} — apply manually in triage.`,
          });
        }
        break;
      case "suggest_priority":
        if (incident) {
          toast({
            title: "Priority suggestion",
            description: `Recommend ${action.priority} for ${incident.id} — review before changing.`,
          });
        }
        break;
      case "run_playbook":
        try {
          if (incident) {
            const result = runPlaybookAgainstIncident(
              action.playbookId,
              incident,
              patchIncidentsInSession,
            );
            toast({
              title: "Playbook running",
              description: `${result.procedure.code} on ${result.incidentId}`,
            });
          } else if (alert) {
            alertsSession.patchAlerts([alert.id], { status: "escalated" });
            const result = runPlaybookFromAlert(
              action.playbookId,
              alert,
              getIncidentFromSession,
              patchIncidentsInSession,
            );
            toast({
              title: "Playbook running",
              description: `${result.procedure.code} via ${result.incidentId}`,
            });
          } else {
            toast({
              title: "Playbook hint",
              description: (
                <span className="inline-flex flex-col gap-1">
                  <span>Run {action.playbookCode} from Knowledge Base.</span>
                  <Link
                    href={action.href}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Open procedure
                  </Link>
                </span>
              ),
            });
          }
        } catch (error) {
          toast({
            title: "Playbook failed",
            description:
              error instanceof Error ? error.message : "Unable to run playbook",
          });
        }
        break;
      case "open_investigate":
        break;
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {investigate ? (
        <InvestigatePlanSnippet
          plan={investigate}
          alert={alert}
          incident={incident}
          onApplyNotes={onApplyNotes}
        />
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {assistChatPrompts.map((prompt) => (
          <Button
            key={prompt.id}
            size="sm"
            variant="secondary"
            className="h-7 rounded-full text-xs"
            disabled={busy}
            onClick={() => runPrompt(prompt.id)}
          >
            {prompt.label}
          </Button>
        ))}
      </div>
      <div className="flex min-h-[280px] flex-1 flex-col gap-3 overflow-y-auto pb-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onApply={onApply} />
        ))}
        {busy ? (
          <p className="text-muted-foreground text-xs">Heimdall is thinking…</p>
        ) : null}
      </div>
    </div>
  );
}

export function AssistChat({
  alert,
  incident,
  investigateQuery,
  onApplyNotes,
  className,
  triggerClassName,
  embedded = false,
  defaultOpen = false,
  triggerLabel = "Ask Heimdall",
}: AssistChatPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (embedded) {
    return (
      <AssistChatBody
        alert={alert}
        incident={incident}
        investigateQuery={investigateQuery}
        onApplyNotes={onApplyNotes}
      />
    );
  }

  const subject = alert?.id ?? incident?.id ?? "investigation";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 gap-1.5", triggerClassName, className)}
        >
          <MessageSquare className="size-3.5" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-md">
        <SheetHeader className="space-y-1 text-left">
          <SheetTitle className="flex items-center gap-2 pr-8">
            <Sparkles className="size-4" />
            Ask Heimdall
          </SheetTitle>
          <SheetDescription>
            Scripted analyst chat for {subject}. Apply actions write into this
            session only.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden px-1 pb-4">
          <AssistChatBody
            alert={alert}
            incident={incident}
            investigateQuery={investigateQuery}
            onApplyNotes={onApplyNotes}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
