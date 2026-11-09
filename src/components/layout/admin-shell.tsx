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
          <div
            role="status"
            className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100"
          >
            Demo console with sample data — not connected to live SIEM, EDR or identity sources.{" "}
            <a
              href="https://svalbard.ca/products/heimdall"
              className="underline underline-offset-2 hover:text-white"
            >
              About Heimdall
            </a>
            {" · "}
            <a
              href="https://svalbard.ca/contact?intent=monitoring"
              className="underline underline-offset-2 hover:text-white"
            >
              Book a coverage review
            </a>
          </div>
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
