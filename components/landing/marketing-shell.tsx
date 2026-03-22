'use client'

import { useEffect } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'

import Footer from '@/components/landing/ui/footer'
import Header from '@/components/landing/ui/header'

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 600,
      easing: 'ease-out-cubic',
      offset: 40,
      delay: 0,
    })
  }, [])

  return (
    <>
      <Header />
      <main className="grow">{children}</main>
      <Footer />
    </>
  )
}
