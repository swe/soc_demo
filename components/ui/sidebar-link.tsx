import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppProvider } from '@/app/app-provider'

interface SidebarLinkProps {
  children: React.ReactNode
  href: string
}

export default function SidebarLink({
  children,
  href,
}: SidebarLinkProps) {

  const pathname = usePathname()
  const { setSidebarOpen } = useAppProvider()  
  
  const isActive = pathname === href
  
  return (
    <Link 
      className={`block text-gray-800 dark:text-gray-100 transition truncate rounded-md -mx-2 px-2 py-1 ${
        isActive 
          ? 'bg-gradient-to-r from-indigo-600/[0.12] dark:from-indigo-600/[0.24] to-indigo-600/[0.04] text-indigo-600 font-medium' 
          : 'hover:text-gray-900 dark:hover:text-white group-[.is-link-group]:text-gray-500/90 dark:group-[.is-link-group]:text-gray-400 hover:group-[.is-link-group]:text-gray-700 dark:hover:group-[.is-link-group]:text-gray-200'
      }`} 
      href={href} 
      onClick={() => setSidebarOpen(false)}
    >
      {children}
    </Link>
  )
}
