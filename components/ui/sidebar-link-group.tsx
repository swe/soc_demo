import { useState } from 'react'

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, openGroup: boolean) => React.ReactNode
  open?: boolean
}

export default function SidebarLinkGroup({
  children,
  open = false
}: SidebarLinkGroupProps) {
  const [openGroup, setOpenGroup] = useState<boolean>(open)

  const handleClick = () => {
    setOpenGroup(!openGroup);
  }

  return (
    <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r group is-link-group ${openGroup && 'from-indigo-600/[0.12] dark:from-indigo-600/[0.24] to-indigo-600/[0.04]'}`}>
      {children(handleClick, openGroup)}
    </li>
  )
}