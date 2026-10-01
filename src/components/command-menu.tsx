"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";

import { useSocRole } from "@/components/auth/soc-role-provider";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { navIcons, sidebarData } from "@/data/sidebar-data";
import { filterNavGroups } from "@/lib/soc-roles";

import { useSearch } from "./search-provider";

const quickOpen = [
  { value: "Investigate query console", label: "Investigate", href: "/investigate", icon: navIcons.investigate },
  { value: "Automation playbooks", label: "Playbooks", href: "/automation/playbooks", icon: navIcons.automation },
  { value: "Playbook builder canvas", label: "Playbook builder", href: "/automation/builder", icon: navIcons.automation },
  { value: "Cloud posture CSPM", label: "Cloud posture", href: "/cloud-posture", icon: navIcons.cloudPosture },
];

export function CommandMenu() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();
  const { effectiveRole } = useSocRole();

  const items = React.useMemo(
    () =>
      filterNavGroups(sidebarData.navGroups, effectiveRole).flatMap(
        (group) => group.items,
      ),
    [effectiveRole],
  );

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen],
  );

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and commands" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {items.map((item) =>
            item.url ? (
              <CommandItem
                key={item.url}
                value={item.title}
                onSelect={() => runCommand(() => router.push(item.url))}
              >
                {item.icon ? <item.icon aria-hidden /> : null}
                {item.title}
              </CommandItem>
            ) : null,
          )}
        </CommandGroup>
        {items.map((item) =>
          item.items ? (
            <CommandGroup key={item.title} heading={item.title}>
              {item.items.map((subItem) => (
                <CommandItem
                  key={subItem.url}
                  value={`${item.title} ${subItem.title}`}
                  onSelect={() => runCommand(() => router.push(subItem.url))}
                >
                  {item.icon ? <item.icon aria-hidden /> : null}
                  {subItem.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null,
        )}
        <CommandSeparator />
        <CommandGroup heading="Quick open">
          {quickOpen.map((entry) => (
            <CommandItem
              key={entry.value}
              value={entry.value}
              onSelect={() => runCommand(() => router.push(entry.href))}
            >
              <entry.icon aria-hidden />
              {entry.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun aria-hidden />
            <span>Light</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon aria-hidden />
            <span>Dark</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop aria-hidden />
            <span>System</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
