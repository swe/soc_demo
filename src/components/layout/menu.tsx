'use client'

import { MenuButton, MenuItems } from '@headlessui/react'
import type { ComponentProps, ReactNode } from 'react'

import Icon from '@/components/ui/icon'

/**
 * Shared menu primitive for all product-shell dropdown menus (organization,
 * profile, future overflow menus). Guarantees one surface, border, radius,
 * shadow, padding, typography, focus behavior, animation, and stacking layer
 * across every menu — all values come from semantic tokens.
 */

/** Header trigger — quiet text button with chevron; states via tokens only. */
export function MenuTrigger({
  children,
  ...props
}: { children: ReactNode } & ComponentProps<typeof MenuButton>) {
  return (
    <MenuButton
      {...props}
      className="inline-flex h-7 max-w-[14rem] items-center gap-1.5 rounded-[var(--radius-md)] px-2
        text-[13px] font-medium text-[color:var(--soc-text-secondary)]
        transition-colors duration-[var(--duration-fast)]
        hover:bg-[color:var(--soc-hover)] hover:text-[color:var(--soc-text)]
        data-[open]:bg-[color:var(--soc-hover)] data-[open]:text-[color:var(--soc-text)]
        disabled:text-[color:var(--soc-text-disabled)] disabled:hover:bg-transparent"
    >
      {children}
      <Icon
        name="chevron-down-outline"
        className="w-3 h-3 shrink-0 text-[color:var(--soc-text-muted)]"
      />
    </MenuButton>
  )
}

/**
 * Menu panel — portal-safe: carries the theme scope classes so tokens resolve
 * even when Headless UI renders it outside the AppShell subtree.
 */
export function MenuPanel({
  children,
  anchor = 'bottom end',
  widthClassName = 'w-60',
}: {
  children: ReactNode
  anchor?: ComponentProps<typeof MenuItems>['anchor']
  widthClassName?: string
}) {
  return (
    <MenuItems
      transition
      anchor={anchor}
      className={`overview-dashboard product-shell z-[var(--z-dropdown)] ${widthClassName}
        rounded-[var(--radius-md)] border border-[color:var(--soc-border-mid)]
        bg-[color:var(--soc-menu)] py-1 [--anchor-gap:6px]
        shadow-[var(--soc-shadow-menu)] focus:outline-none
        origin-top transition duration-[var(--duration-fast)] ease-out
        data-[closed]:scale-[0.98] data-[closed]:opacity-0`}
    >
      {children}
    </MenuItems>
  )
}

/** Identity / context header block at the top of a menu. */
export function MenuHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="px-3 pt-1.5 pb-2 mb-1 border-b border-[color:var(--soc-border)]">
      <p className="truncate text-[13px] font-medium text-[color:var(--soc-text)]">{title}</p>
      {subtitle ? (
        <p className="truncate text-xs text-[color:var(--soc-text-muted)]">{subtitle}</p>
      ) : null}
    </div>
  )
}

/** Uppercase group label inside a menu (e.g. "Organizations"). */
export function MenuGroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pt-1.5 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[color:var(--soc-text-muted)]">
      {children}
    </p>
  )
}

export function MenuDivider() {
  return <div className="my-1 h-px bg-[color:var(--soc-border)]" aria-hidden />
}

const MENU_ROW_BASE = `flex w-full items-center gap-2.5 px-3 h-8 text-left text-[13px] leading-none
  text-[color:var(--soc-text)] no-underline transition-colors duration-[var(--duration-fast)]
  data-[focus]:bg-[color:var(--soc-hover)]`

const MENU_ROW_DESTRUCTIVE = `flex w-full items-center gap-2.5 px-3 h-8 text-left text-[13px] leading-none
  text-[color:var(--soc-text)] no-underline transition-colors duration-[var(--duration-fast)]
  data-[focus]:bg-[color:var(--soc-danger-bg)] data-[focus]:text-[color:var(--soc-danger)]`

/**
 * Classes for a menu row. Rows are plain text-colored with a full-row
 * hover/focus fill; destructive rows only reveal the danger tone on
 * hover/focus. Pass to Headless UI `MenuItem` children (Link or button).
 */
export function menuRowClass(opts?: { destructive?: boolean }) {
  return opts?.destructive ? MENU_ROW_DESTRUCTIVE : MENU_ROW_BASE
}

/** Left-aligned icon inside a menu row. */
export function MenuRowIcon({ name }: { name: string }) {
  return <Icon name={name} className="w-4 h-4 shrink-0 text-[color:var(--soc-text-muted)]" />
}
