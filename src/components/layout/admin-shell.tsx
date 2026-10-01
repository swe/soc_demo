"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { MobileMoreSheet } from "@/components/layout/mobile-more-sheet";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface Props {
  children: React.ReactNode;
  defaultOpen: boolean;
}

/**
 * Content column is viewport-locked (`h-svh`) so the header stays pinned and
 * pages scroll inside `{children}`. On phones the tab bar is the last row of
 * that column, so it never covers page content.
 */
export function AdminShell({ children, defaultOpen }: Props) {
  return (
    <RequireAuth>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div
          id="content"
          data-layout="fixed"
          className="bg-canvas flex h-svh w-full min-w-0 flex-col overflow-hidden"
        >
          <Header />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
          <MobileTabBar />
        </div>
        <MobileMoreSheet />
      </SidebarProvider>
    </RequireAuth>
  );
}
