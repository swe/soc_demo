'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header({ nav = true }: {
  nav?: boolean
}) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed w-full z-30 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/80 backdrop-blur-md' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Site branding */}
          <div className="shrink-0 mr-4">
            {/* Logo */}
            <Link className="block" href="/" aria-label="Svalbard Intelligence">
              <img src="/logo.png" alt="Svalbard Logo" className="w-[100px] h-auto" />
            </Link>
          </div>

          {/* Desktop navigation */}
          {nav &&
            <nav className="flex grow">
              {/* Desktop navigation links */}
              <ul className="flex grow justify-end flex-wrap items-center">
                <li>
                  <Link className={`font-medium px-3 lg:px-5 py-2 flex items-center transition duration-150 ease-in-out ${
                    isScrolled 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`} href="/overview">
                    Explore
                  </Link>
                </li>
                <li className="ml-3">
                  <a className="btn-sm text-white bg-linear-to-t from-blue-600 to-blue-400 hover:to-blue-500 w-full shadow-lg group" href="#contact-form">
                    Talk to Sales <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">→</span>
                  </a>
                </li>
              </ul>
            </nav>
          }
        </div>
      </div>
    </header>
  )
}
