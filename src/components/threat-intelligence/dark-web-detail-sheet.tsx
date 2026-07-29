"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  CircleCheck,
  CircleX,
  Ellipsis,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  getHuntById,
  getIndicatorsForExposure,
} from "@/components/threats/threat-shared-data";

import {
  type DarkWebExposure,
  type ExposureStatus,
  exposureStatusLabels,
  getBreachById,
  getLinkedIdentity,
} from "./dark-web-data";
import {
  ExposureStatusBadge,
  ExposureTypeBadge,
  RiskScoreBadge,
  SeverityBadge,
  SheetDetailRow,
  mutedControlClassName,
} from "./dark-web-primitives";

export function DarkWebDetailSheet({
  exposure,
  open,
  onOpenChange,
  onSetStatus,
  onOpenBreach,
}: {
  exposure: DarkWebExposure | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetStatus: (id: string, status: ExposureStatus) => void;
  onOpenBreach: (breachId: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const identity = getLinkedIdentity(exposure?.identityId);
  const breach = getBreachById(exposure?.breachId);
  const linkedIndicators = exposure
    ? getIndicatorsForExposure(exposure.id)
    : [];
  const linkedHunts = linkedIndicators.flatMap((indicator) =>
    indicator.relatedHuntIds
      .map((id) => getHuntById(id))
      .filter((hunt): hunt is NonNullable<typeof hunt> => Boolean(hunt)),
  );

  const canReveal = Boolean(exposure?.secretRevealable);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setRevealed(false);
        onOpenChange(next);
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        {exposure ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="flex items-start gap-3">
                <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
                  <KeyRound className="text-muted-foreground size-4" />
                </span>
                <div className="min-w-0">
                  <SheetTitle className="text-base leading-snug">
                    {exposure.title}
                  </SheetTitle>
                  <SheetDescription className="mt-1 font-mono text-xs">
                    {exposure.id}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={exposure.severity} />
                <ExposureTypeBadge type={exposure.type} />
                <ExposureStatusBadge status={exposure.status} />
                <RiskScoreBadge score={exposure.riskScore} />
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 pb-6">
              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Finding
                </h3>
                <SheetDetailRow label="Source">{exposure.source}</SheetDetailRow>
                <SheetDetailRow label="First seen">
                  {exposure.firstSeenLabel}
                </SheetDetailRow>
                <SheetDetailRow label="Last seen">
                  {exposure.lastSeenLabel}
                </SheetDetailRow>
                {exposure.domain ? (
                  <SheetDetailRow label="Domain">
                    {exposure.domain}
                  </SheetDetailRow>
                ) : null}
                {exposure.malwareFamily ? (
                  <SheetDetailRow label="Malware">
                    {exposure.malwareFamily}
                  </SheetDetailRow>
                ) : null}
                {exposure.url ? (
                  <SheetDetailRow label="URL">
                    <span className="font-mono text-xs">{exposure.url}</span>
                  </SheetDetailRow>
                ) : null}
                {exposure.snippet ? (
                  <div className="bg-muted/40 rounded-md border p-2.5">
                    <p className="text-muted-foreground mb-1 text-[11px] uppercase">
                      Snippet
                    </p>
                    <p className="font-mono text-xs leading-relaxed break-all">
                      {exposure.snippet}
                    </p>
                  </div>
                ) : null}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {exposure.notes}
                </p>
              </section>

              {(exposure.principal ||
                exposure.secretMasked !== "—" ||
                canReveal) && (
                <section className="space-y-2.5">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Exposed secret
                  </h3>
                  {exposure.principal ? (
                    <SheetDetailRow label="Principal">
                      <span className="font-mono text-xs">
                        {exposure.principal}
                      </span>
                    </SheetDetailRow>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground shrink-0">
                      Secret
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-mono text-xs">
                        {revealed && exposure.secretRevealable
                          ? exposure.secretRevealable
                          : exposure.secretMasked}
                      </span>
                      {canReveal ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn("h-7 gap-1 px-2", mutedControlClassName)}
                          onClick={() => {
                            if (!revealed) {
                              toast({
                                title: "Secret revealed",
                                description:
                                  "Demo only — reveal is audited in production.",
                              });
                            }
                            setRevealed((current) => !current);
                          }}
                        >
                          {revealed ? (
                            <EyeOff className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                          {revealed ? "Hide" : "Reveal"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {exposure.passwordFlags && exposure.passwordFlags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {exposure.passwordFlags.map((flag) => (
                        <span
                          key={flag}
                          className="border-border/70 bg-muted/40 text-muted-foreground inline-flex whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium capitalize"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </section>
              )}

              {identity ? (
                <section className="space-y-2.5">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Matched asset
                  </h3>
                  <SheetDetailRow label="Identity">
                    <Link
                      href={`/assets/identities?q=${encodeURIComponent(identity.principal)}`}
                      className="text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
                    >
                      {identity.displayName}
                      <ExternalLink className="size-3" />
                    </Link>
                  </SheetDetailRow>
                  <SheetDetailRow label="Principal">
                    <span className="font-mono text-xs">
                      {identity.principal}
                    </span>
                  </SheetDetailRow>
                  <SheetDetailRow label="Privileged">
                    {identity.privileged ? "Yes" : "No"}
                  </SheetDetailRow>
                  <SheetDetailRow label="MFA">
                    {identity.mfaEnabled === null
                      ? "N/A"
                      : identity.mfaEnabled
                        ? "Enabled"
                        : "Disabled"}
                  </SheetDetailRow>
                  <SheetDetailRow label="Risk score">
                    <RiskScoreBadge score={identity.riskScore} />
                  </SheetDetailRow>
                </section>
              ) : exposure.principal ? (
                <section className="space-y-2">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Matched asset
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    No identity inventory match for{" "}
                    <span className="text-foreground font-mono text-xs">
                      {exposure.principal}
                    </span>
                    .
                  </p>
                </section>
              ) : null}

              {breach ? (
                <section className="space-y-2.5">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Source context
                  </h3>
                  <SheetDetailRow label="Breach">
                    <button
                      type="button"
                      className="text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
                      onClick={() => onOpenBreach(breach.id)}
                    >
                      {breach.name}
                      <ExternalLink className="size-3" />
                    </button>
                  </SheetDetailRow>
                  <SheetDetailRow label="Published">
                    {breach.dateLabel}
                  </SheetDetailRow>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {breach.summary}
                  </p>
                </section>
              ) : null}

              {linkedIndicators.length > 0 ? (
                <section className="space-y-2.5">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Threat intelligence
                  </h3>
                  <ul className="space-y-2">
                    {linkedIndicators.map((indicator) => (
                      <li key={indicator.id}>
                        <Link
                          href={`/threat-intelligence?indicator=${indicator.id}`}
                          className="hover:bg-muted/60 flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-mono text-xs">
                              {indicator.id}
                            </span>
                            <p className="mt-0.5 truncate font-mono text-[11px]">
                              {indicator.value}
                            </p>
                          </div>
                          <ExternalLink className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {linkedHunts[0] ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("justify-start", mutedControlClassName)}
                      asChild
                    >
                      <Link
                        href={`/threat-hunting/hunts?hunt=${linkedHunts[0].id}`}
                      >
                        Open related hunt {linkedHunts[0].id}
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("justify-start", mutedControlClassName)}
                      asChild
                    >
                      <Link
                        href={`/threat-hunting/hunts?indicator=${linkedIndicators[0]?.id}`}
                      >
                        Start hunt from indicator
                      </Link>
                    </Button>
                  )}
                </section>
              ) : (
                <section className="space-y-2.5">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Threat intelligence
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("justify-start", mutedControlClassName)}
                    asChild
                  >
                    <Link href="/threat-intelligence">
                      Open indicators
                      <ExternalLink className="ml-1.5 size-3" />
                    </Link>
                  </Button>
                </section>
              )}

              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Recommended actions
                </h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("justify-start", mutedControlClassName)}
                    asChild
                  >
                    <Link href="/assets/identities">
                      Force password reset / review identity
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("justify-start", mutedControlClassName)}
                    asChild
                  >
                    <Link href="/knowledge-base/trainings">
                      Open awareness training
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("justify-start", mutedControlClassName)}
                    asChild
                  >
                    <Link href="/incidents">Escalate via incidents</Link>
                  </Button>
                </div>
              </section>

              <Separator />

              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Triage
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "investigating",
                      "remediated",
                      "false_positive",
                      "accepted_risk",
                    ] as ExposureStatus[]
                  ).map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                      disabled={exposure.status === status}
                      onClick={() => {
                        onSetStatus(exposure.id, status);
                        toast({
                          title: "Status updated",
                          description: `${exposure.id} → ${exposureStatusLabels[status]}`,
                        });
                      }}
                    >
                      {status === "investigating" ? (
                        <ShieldAlert className="size-3.5" />
                      ) : status === "remediated" ? (
                        <CircleCheck className="size-3.5" />
                      ) : status === "false_positive" ? (
                        <CircleX className="size-3.5" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      {exposureStatusLabels[status]}
                    </Button>
                  ))}
                </div>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Activity
                </h3>
                <ul className="space-y-3">
                  {exposure.activity.map((event, index) => (
                    <li key={`${event.at}-${index}`} className="flex gap-3">
                      <span className="bg-border mt-1.5 size-1.5 shrink-0 rounded-full" />
                      <div className="min-w-0">
                        <p className="text-sm">{event.label}</p>
                        <p className="text-muted-foreground text-xs">
                          {event.at}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

/** Kept for table row menu icon consistency. */
export function ExposureRowMenuIcon() {
  return <Ellipsis className="size-4" />;
}
