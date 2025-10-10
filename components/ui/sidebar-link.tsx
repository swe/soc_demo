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
      className={`block text-gray-800 dark:text-gray-100 transition truncate ${
        isActive 
          ? 'text-indigo-600 dark:text-indigo-400 font-medium group-[.is-link-group]:text-indigo-600 dark:group-[.is-link-group]:text-indigo-400' 
          : 'hover:text-gray-900 dark:hover:text-white group-[.is-link-group]:text-gray-500/90 dark:group-[.is-link-group]:text-gray-400 hover:group-[.is-link-group]:text-gray-700 dark:hover:group-[.is-link-group]:text-gray-200'
      }`} 
      href={href} 
      onClick={() => setSidebarOpen(false)}
    >
      {children}
    </Link>
  )
}
