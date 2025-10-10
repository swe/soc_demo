'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Icon from '@/components/ui/icon'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <span className="sr-only">Loading theme toggle...</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleThemeChange}
      className="flex items-center justify-center cursor-pointer w-8 h-8 hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Icon name="sunny-outline" className="text-lg text-gray-500 dark:text-gray-400" />
      ) : (
        <Icon name="moon-outline" className="text-lg text-gray-500 dark:text-gray-400" />
      )}
    </button>
  )
}
