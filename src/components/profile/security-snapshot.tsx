"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import Link from "next/link";

import {
  type CurrentProfile,
  getSecuritySnapshotScore,
} from "@/components/profile/profile-data";
import { ProfileSection } from "@/components/profile/profile-section";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SecuritySnapshot({ profile }: { profile: CurrentProfile }) {
  const snapshot = getSecuritySnapshotScore(profile);

  return (
    <ProfileSection
      title="Security Snapshot"
      description="A quick checklist of the strongest protections for your account."
      action={
        <div className="text-right">
          <p className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {snapshot.percent}
            <span className="text-muted-foreground text-base font-medium">
              %
            </span>
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {snapshot.passed}/{snapshot.total} checks passed
          </p>
        </div>
      }
    >
      <ul className="divide-border divide-y rounded-md border">
        {snapshot.checklist.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="hover:bg-muted/40 flex items-start gap-3 px-4 py-3 transition-colors"
            >
              {item.passed ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-text" />
              ) : (
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning-text" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{item.label}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full",
                      item.passed
                        ? "border-success/40 bg-success/10 text-success-text"
                        : "border-warning/40 bg-warning/10 text-warning-text",
                    )}
                  >
                    {item.passed ? "Pass" : "Action needed"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {item.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </ProfileSection>
  );
}
