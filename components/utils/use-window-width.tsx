"use client"

import { useState, useEffect } from 'react'

export const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined)
  const [isMounted, setIsMounted] = useState<boolean>(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Set initial width
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted]); // Empty array ensures effect is only run on mount and unmount
  
  // Return undefined during SSR and initial mount to prevent hydration mismatch
  if (!isMounted) {
    return undefined
  }
  
  return windowWidth;
};