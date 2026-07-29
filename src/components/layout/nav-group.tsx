"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Badge } from "../ui/badge";
import { type NavGroup, NavItem } from "./types";

export function NavGroup({ title, items }: NavGroup) {
  const { setOpenMobile, state, isMobile } = useSidebar();
  const pathname = usePathname();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      {title ? <SidebarGroupLabel>{title}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {items.map((item) => {
          if (!item.items) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={checkIsActive(pathname, item, true)}
                  tooltip={item.title}
                >
                  <Link href={item.url} onClick={() => setOpenMobile(false)}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && <NavBadge>{item.badge}</NavBadge>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          if (collapsed) {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      isActive={checkIsActive(pathname, item, true)}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.badge && <NavBadge>{item.badge}</NavBadge>}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-56 rounded-lg"
                    side="right"
                    align="start"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                    {item.items.map((subItem) => (
                      <DropdownMenuItem key={subItem.title} asChild>
                        <Link
                          href={subItem.url}
                          onClick={() => setOpenMobile(false)}
                        >
                          {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                          {subItem.badge && (
                            <NavBadge>{subItem.badge}</NavBadge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={checkIsActive(pathname, item, true)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && <NavBadge>{item.badge}</NavBadge>}
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="CollapsibleContent">
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={checkIsActive(
                            pathname,
                            subItem,
                            false,
                            item.items,
                          )}
                        >
                          <Link
                            href={subItem.url}
                            onClick={() => setOpenMobile(false)}
                          >
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                            {subItem.badge && (
                              <NavBadge>{subItem.badge}</NavBadge>
                            )}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
);

function checkIsActive(
  href: string,
  item: NavItem,
  _mainNav = false,
  siblings?: NavItem[],
): boolean {
  const currentPath = normalizePath(href);

  if (item.items) {
    return item.items.some((subItem) =>
      checkIsActive(currentPath, subItem, false, item.items),
    );
  }

  const itemPath = normalizePath(item.url);
  if (currentPath === itemPath) {
    return true;
  }

  // Keep section roots active on nested routes (e.g. /alerts → /alerts/list),
  // but not when a sibling nav item is a more specific match
  // (e.g. /threat-intelligence vs /threat-intelligence/dark-web).
  if (itemPath === "/" || !currentPath.startsWith(`${itemPath}/`)) {
    return false;
  }

  if (siblings) {
    const hasMoreSpecificSibling = siblings.some((sibling) => {
      if (sibling.items) return false;
      const siblingPath = normalizePath(sibling.url);
      if (siblingPath === itemPath) return false;
      return (
        currentPath === siblingPath ||
        currentPath.startsWith(`${siblingPath}/`)
      );
    });
    if (hasMoreSpecificSibling) return false;
  }

  return true;
}

function normalizePath(url: string): string {
  const [path] = url.split("?");
  return path.replace(/\/$/, "") || "/";
}
