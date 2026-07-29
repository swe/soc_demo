"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  defaultOpen: boolean;
}

/**
 * Content column is always viewport-locked (`h-svh`) so the app header stays
 * pinned on every route. Pages scroll inside `{children}`, not the shell.
 */
export function AdminShell({ children, defaultOpen }: Props) {
  return (
    <RequireAuth>
      <div className="border-grid flex flex-1 flex-col">
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <div
            id="content"
            data-layout="fixed"
            className={cn(
              "flex h-svh w-full min-w-0 flex-col overflow-hidden",
              "group-data-[scroll-locked=1]/body:h-svh",
            )}
          >
            <Header />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </div>
        </SidebarProvider>
      </div>
    </RequireAuth>
  );
}
