import type { SocNavId } from "@/lib/soc-roles";

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
  /** Stable id for SOC ACL filtering. */
  id?: SocNavId;
}

export type NavItem =
  | (BaseNavItem & {
      items: (BaseNavItem & { url: string; id?: SocNavId })[];
      url?: never;
    })
  | (BaseNavItem & {
      url: string;
      items?: never;
    });

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarData {
  user: User;
  navGroups: NavGroup[];
}

export type { NavGroup, SidebarData };
