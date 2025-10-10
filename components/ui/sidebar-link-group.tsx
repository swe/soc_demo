import { useState, useEffect } from 'react'

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, openGroup: boolean) => React.ReactNode
  open?: boolean
}

export default function SidebarLinkGroup({
  children,
  open = false
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
    <li className="pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 group is-link-group">
      {children(handleClick, openGroup)}
    </li>
  )
}