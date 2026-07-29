"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { RequireAuth } from "@/components/auth/require-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  defaultOpen: boolean;
}

export function AdminShell({ children, defaultOpen }: Props) {
  return (
    <RequireAuth>
      <div className="border-grid flex flex-1 flex-col">
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <div
            id="content"
            className={cn(
              "flex h-full w-full min-w-0 flex-col",
              "has-[div[data-layout=fixed]]:h-svh",
              "group-data-[scroll-locked=1]/body:h-full",
              "has-[data-layout=fixed]:group-data-[scroll-locked=1]/body:h-svh",
            )}
          >
            <Header />
            {children}
          </div>
        </SidebarProvider>
      </div>
    </RequireAuth>
  );
}
