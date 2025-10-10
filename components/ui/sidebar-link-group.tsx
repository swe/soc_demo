import { useState, useEffect } from 'react'

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, openGroup: boolean) => React.ReactNode
  open?: boolean
  active?: boolean // Is any page in this group active?
}

export default function SidebarLinkGroup({
  children,
  open = false,
  active = false
}: SidebarLinkGroupProps) {
  const [openGroup, setOpenGroup] = useState<boolean>(open)

  // Sync state with prop when it changes (e.g., navigation)
  useEffect(() => {
    setOpenGroup(open)
  }, [open])

  const handleClick = () => {
    setOpenGroup(!openGroup);
  }

  return (
    <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r group is-link-group ${active && 'from-indigo-600/[0.12] dark:from-indigo-600/[0.24] to-indigo-600/[0.04]'}`}>
      {children(handleClick, openGroup)}
    </li>
  )
}