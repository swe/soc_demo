"use client";

import { Logo } from "@/components/logo";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { site } from "@/data/site";
import { useCompanyLogo } from "@/hooks/use-company-logo";

export function SidebarBrand() {
  const { logoSrc, mounted } = useCompanyLogo();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground"
          asChild
        >
          <div>
            <div className="border-muted-foreground/25 flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg border bg-transparent">
              {mounted && logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL
                <img
                  src={logoSrc}
                  alt={site.logoAlt}
                  className="size-full object-contain p-0.5"
                />
              ) : (
                <Logo className="size-4" />
              )}
            </div>
            <div className="grid min-w-0 flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">{site.title}</span>
              <span className="truncate text-xs">
                {site.planLink.prefix}
                <a
                  href={site.planLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sidebar-accent-foreground underline-offset-2 hover:underline"
                >
                  {site.planLink.label}
                </a>
              </span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
