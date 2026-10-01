"use client";

import { useMemo } from "react";

import { useAuthSession } from "@/components/auth/auth-session";
import { useSocRole } from "@/components/auth/soc-role-provider";
import { NavGroup } from "@/components/layout/nav-group";
import { NavUser } from "@/components/layout/nav-user";
import { SidebarBrand } from "@/components/layout/sidebar-brand";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { sidebarData } from "@/data/sidebar-data";
import { filterNavGroups } from "@/lib/soc-roles";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { effectiveRole } = useSocRole();
  const { user } = useAuthSession();
  const { isMobile } = useSidebar();

  const navGroups = useMemo(
    () => filterNavGroups(sidebarData.navGroups, effectiveRole),
    [effectiveRole],
  );

  const sidebarUser = useMemo(
    () => ({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }),
    [user],
  );

  // Phones navigate with the tab bar and the More sheet instead.
  if (isMobile) return null;

  return (
    <div className="relative">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarBrand />
        </SidebarHeader>
        <SidebarContent>
          {navGroups.map((group, index) => (
            <NavGroup key={group.title || `nav-${index}`} {...group} />
          ))}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={sidebarUser} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
