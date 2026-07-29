"use client";

import { ArrowUpRight, Construction, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ModulePlaceholderLink = {
  label: string;
  href: string;
  description?: string;
};

export function ModulePlaceholder({
  title,
  description,
  icon: Icon = Construction,
  links,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  links: ModulePlaceholderLink[];
}) {
  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-lg space-y-6">
          <div className="bg-card rounded-xl border border-dashed p-8 text-center">
            <div className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
              <Icon className="text-muted-foreground size-5" />
            </div>
            <h1 className="mt-4 text-lg font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Continue in live modules
            </p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "border-border/70 bg-card hover:bg-muted/40 group flex cursor-pointer items-start justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
                    )}
                  >
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-medium">{link.label}</p>
                      {link.description ? (
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {link.description}
                        </p>
                      ) : null}
                    </div>
                    <ArrowUpRight className="text-muted-foreground group-hover:text-foreground mt-0.5 size-4 shrink-0 transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/alerts/overview">Back to alerts overview</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
