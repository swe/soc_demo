'use client'

import { useState, useEffect, useRef } from 'react'

export const useScroll = (threshold: number = 100) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Find the scroll container (the content area with overflow-y-auto)
    const findScrollContainer = () => {
      // Look for the specific content area in the layout
      const contentArea = document.querySelector('.flex.flex-col.flex-1.overflow-y-auto') as HTMLElement
      if (contentArea) {
        return contentArea
      }
      
      // Fallback to window
      return window
    }

    scrollContainerRef.current = findScrollContainer()

    const handleScroll = () => {
      const container = scrollContainerRef.current
      if (!container) return

      let scrollTop = 0
      if (container === window) {
        scrollTop = window.scrollY || document.documentElement.scrollTop
      } else {
        scrollTop = container.scrollTop
      }
      
      setIsScrolled(scrollTop > threshold)
    }

    // Add event listener to the correct container
    scrollContainerRef.current.addEventListener('scroll', handleScroll, { passive: true })
    
    // Set initial state
    handleScroll()

    // Remove event listener on cleanup
    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [threshold, isMounted])
  
  // Return false during SSR and initial mount to prevent hydration mismatch
  if (!isMounted) {
    return false
  }
  
  return isScrolled
}
