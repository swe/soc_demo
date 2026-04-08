'use client'

import { useEffect, useRef } from 'react'
import { useAppProvider } from '@/app/app-provider'
import { useSelectedLayoutSegments } from 'next/navigation'
import { useWindowWidth } from '@/components/utils/use-window-width'
import SidebarLinkGroup from './sidebar-link-group'
import SidebarLink from './sidebar-link'
import Logo from './logo'
import Icon from './icon'
import Link from 'next/link'

export default function Sidebar({
  variant = 'default',
}: {
  variant?: 'default' | 'v2'
}) {
  const sidebar = useRef<HTMLDivElement>(null)
  const { sidebarOpen, setSidebarOpen, sidebarExpanded, setSidebarExpanded } = useAppProvider()
  const segments = useSelectedLayoutSegments()  
  const breakpoint = useWindowWidth();
  const expandOnly = !sidebarExpanded && breakpoint && (breakpoint >= 1024 && breakpoint < 1280)

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {      
      if (!sidebar.current) return
      if (!sidebarOpen || sidebar.current.contains(target as Node)) return
      setSidebarOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!sidebarOpen || keyCode !== 27) return
      setSidebarOpen(false)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  }) 

  return (
    <div className={`min-w-fit ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-50 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>    

      {/* Sidebar shadow */}
      <div
        className={`absolute z-60 left-64 top-0 w-4 h-full bg-gradient-to-r from-black/10 to-transparent pointer-events-none transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0"
        } lg:hidden`}
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-50 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-hidden no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 xl:w-64! shrink-0 bg-white dark:bg-gray-800 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} border-r border-gray-200 dark:border-gray-700/60 shadow-xl`}
      >      
        {/* Sidebar header - Fixed */}
        <div className="sticky top-0 z-10 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10">
          <div className="relative flex h-16 items-center justify-center px-4 sm:px-6 lg:px-8">
            {/* Close button: absolute so logo + title stay centered on mobile */}
            <button
              type="button"
              className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 sm:pl-6 lg:hidden text-gray-500 hover:text-gray-400"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
            >
              <span className="sr-only">Close sidebar</span>
              <Icon name="arrow-back-outline" className="w-6 h-6 text-gray-500" />
            </button>
            {/* Logo and Title */}
            <Link href="/" className="flex items-center justify-center lg:w-full lg:justify-center hover:opacity-80 transition-opacity duration-200">
              <Logo withLink={false} />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 transition-opacity duration-200">
                Heimdall
              </span>
            </Link>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-8 p-4 flex-1 overflow-y-auto">
          {/* Security Dashboard */}
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span className="hidden lg:block lg:sidebar-expanded:hidden xl:hidden text-center w-6" aria-hidden="true">
                •••
              </span>
              <span className="lg:hidden lg:sidebar-expanded:block xl:block">Security Dashboard</span>
            </h3>
            <ul className="mt-3">
              {/* Overview */}
              <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${segments.length === 0 && 'from-indigo-500/[0.12] dark:from-indigo-500/[0.24] to-indigo-500/[0.04]'}`}>
                <SidebarLink href="/overview">
                  <div className="flex items-center">
                    <Icon name="pie-chart-outline" className={`text-base flex-shrink-0 ${segments.length === 0 ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                      Overview
                    </span>
                  </div>
                </SidebarLink>
              </li>
              {/* Alerts & Incidents */}
              <SidebarLinkGroup 
                open={segments.includes('alerts') || segments.includes('incidents')}
                active={segments.includes('alerts') || segments.includes('incidents')}
              >
                {(handleClick, open) => {
                  return (
                    <>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition ${segments.includes('alerts') || segments.includes('incidents') ? '' : 'hover:text-gray-900 dark:hover:text-white'
                          }`}
                        onClick={(e) => {
                          e.preventDefault()
                          expandOnly ? setSidebarExpanded(true) : handleClick()
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon name="notifications-outline" className={`text-base flex-shrink-0 ${segments.includes('alerts') || segments.includes('incidents') ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                              Alerts & Incidents
                            </span>
                          </div>
                          {/* Icon */}
                          <div className="flex shrink-0 ml-2">
                            <Icon
                              name="chevron-down-outline"
                              className={`w-3 h-3 shrink-0 ml-1 text-gray-400 dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block xl:block">
                        <ul className={`pl-8 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/alerts">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                All Alerts
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/incidents">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Incidents
                              </span>
                            </SidebarLink>
                          </li>
                        </ul>
                      </div>
                    </>
                  )
                }}
              </SidebarLinkGroup>
              {/* Assets */}
              <SidebarLinkGroup 
                open={segments.includes('assets')}
                active={segments.includes('assets')}
              >
                {(handleClick, open) => {
                  return (
                    <>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition ${segments.includes('assets') ? '' : 'hover:text-gray-900 dark:hover:text-white'
                          }`}
                        onClick={(e) => {
                          e.preventDefault()
                          expandOnly ? setSidebarExpanded(true) : handleClick()
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon name="hardware-chip-outline" className={`text-base flex-shrink-0 ${segments.includes('assets') ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                              Assets
                            </span>
                          </div>
                          {/* Icon */}
                          <div className="flex shrink-0 ml-2">
                            <Icon
                              name="chevron-down-outline"
                              className={`w-3 h-3 shrink-0 ml-1 text-gray-400 dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block xl:block">
                        <ul className={`pl-8 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/assets/devices">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Devices
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/assets/identities">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Identities
                              </span>
                            </SidebarLink>
                          </li>
                        </ul>
                      </div>
                    </>
                  )
                }}
              </SidebarLinkGroup>
              {/* Vulnerabilities */}
              <SidebarLinkGroup 
                open={segments.includes('vulnerability')}
                active={segments.includes('vulnerability')}
              >
                {(handleClick, open) => {
                  return (
                    <>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition ${segments.includes('vulnerability') ? '' : 'hover:text-gray-900 dark:hover:text-white'
                          }`}
                        onClick={(e) => {
                          e.preventDefault()
                          expandOnly ? setSidebarExpanded(true) : handleClick()
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon name="shield-checkmark-outline" className={`text-base flex-shrink-0 ${segments.includes('vulnerability') ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                              Vulnerabilities
                            </span>
                          </div>
                          {/* Icon */}
                          <div className="flex shrink-0 ml-2">
                            <Icon
                              name="chevron-down-outline"
                              className={`w-3 h-3 shrink-0 ml-1 text-gray-400 dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block xl:block">
                        <ul className={`pl-8 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/vulnerability/dashboard">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Dashboard
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/vulnerability/recommendations">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Recommendations
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/vulnerability/remediations">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Remediations
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/vulnerability/inventories">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Inventories
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/vulnerability/weaknesses">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Weaknesses
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/vulnerability/event-timeline">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Event Timeline
                              </span>
                            </SidebarLink>
                          </li>
                        </ul>
                      </div>
                    </>
                  )
                }}
              </SidebarLinkGroup>
              {/* Threat Hunting */}
              <SidebarLinkGroup 
                open={segments.includes('threat-hunting')}
                active={segments.includes('threat-hunting')}
              >
                {(handleClick, open) => {
                  return (
                    <>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition ${segments.includes('threat-hunting') ? '' : 'hover:text-gray-900 dark:hover:text-white'
                          }`}
                        onClick={(e) => {
                          e.preventDefault()
                          expandOnly ? setSidebarExpanded(true) : handleClick()
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon name="search-outline" className={`text-base flex-shrink-0 ${segments.includes('threat-hunting') ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                              Threat Hunting
                            </span>
                          </div>
                          {/* Icon */}
                          <div className="flex shrink-0 ml-2">
                            <Icon
                              name="chevron-down-outline"
                              className={`w-3 h-3 shrink-0 ml-1 text-gray-400 dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block xl:block">
                        <ul className={`pl-8 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/threat-hunting/analytics">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Threat Analytics
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/threat-hunting/map">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Threat Map
                              </span>
                            </SidebarLink>
                          </li>
                        </ul>
                      </div>
                    </>
                  )
                }}
              </SidebarLinkGroup>
              {/* Threat Intelligence */}
              <SidebarLinkGroup 
                open={segments.includes('threat-intelligence')}
                active={segments.includes('threat-intelligence')}
              >
                {(handleClick, open) => {
                  return (
                    <>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition ${segments.includes('threat-intelligence') ? '' : 'hover:text-gray-900 dark:hover:text-white'
                          }`}
                        onClick={(e) => {
                          e.preventDefault()
                          expandOnly ? setSidebarExpanded(true) : handleClick()
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon name="analytics-outline" className={`text-base flex-shrink-0 ${segments.includes('threat-intelligence') ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                              Threat Intelligence
                            </span>
                          </div>
                          {/* Icon */}
                          <div className="flex shrink-0 ml-2">
                            <Icon
                              name="chevron-down-outline"
                              className={`w-3 h-3 shrink-0 ml-1 text-gray-400 dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block xl:block">
                        <ul className={`pl-8 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/threat-intelligence/overview">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Overview
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/threat-intelligence/dark-web">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Dark Web Monitoring
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/threat-intelligence/feeds">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Threat Feeds
                              </span>
                            </SidebarLink>
                          </li>
                        </ul>
                      </div>
                    </>
                  )
                }}
              </SidebarLinkGroup>
              {/* Compliance */}
              <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${segments.includes('compliance') && 'from-indigo-600/[0.12] dark:from-indigo-600/[0.24] to-indigo-600/[0.04]'}`}>
                <SidebarLink href="/overview/compliance">
                  <div className="flex items-center">
                    <Icon name="document-text-outline" className={`text-base flex-shrink-0 ${segments.includes('compliance') ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                      Compliance
                    </span>
                  </div>
                </SidebarLink>
              </li>
              {/* Knowledge Base */}
              <SidebarLinkGroup 
                open={segments.includes('knowledge-base')}
                active={segments.includes('knowledge-base')}
              >
                {(handleClick, open) => {
                  return (
                    <>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition ${segments.includes('knowledge-base') ? '' : 'hover:text-gray-900 dark:hover:text-white'
                          }`}
                        onClick={(e) => {
                          e.preventDefault()
                          expandOnly ? setSidebarExpanded(true) : handleClick()
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon name="library-outline" className={`text-base flex-shrink-0 ${segments.includes('knowledge-base') ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                              Knowledge Base
                            </span>
                          </div>
                          {/* Icon */}
                          <div className="flex shrink-0 ml-2">
                            <Icon
                              name="chevron-down-outline"
                              className={`w-3 h-3 shrink-0 ml-1 text-gray-400 dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block xl:block">
                        <ul className={`pl-8 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/knowledge-base/documentation">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Documentation
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/knowledge-base/procedures">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Procedures
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/knowledge-base/reports">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Reports
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/knowledge-base/trainings">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Trainings
                              </span>
                            </SidebarLink>
                          </li>
                        </ul>
                      </div>
                    </>
                  )
                }}
              </SidebarLinkGroup>
              {/* Administration */}
              <SidebarLinkGroup 
                open={segments.includes('administration')}
                active={segments.includes('administration')}
              >
                {(handleClick, open) => {
                  return (
                    <>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition ${segments.includes('administration') ? '' : 'hover:text-gray-900 dark:hover:text-white'
                          }`}
                        onClick={(e) => {
                          e.preventDefault()
                          expandOnly ? setSidebarExpanded(true) : handleClick()
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon name="settings-outline" className={`text-base flex-shrink-0 ${segments.includes('administration') ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                              Administration
                            </span>
                          </div>
                          {/* Icon */}
                          <div className="flex shrink-0 ml-2">
                            <Icon
                              name="chevron-down-outline"
                              className={`w-3 h-3 shrink-0 ml-1 text-gray-400 dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block xl:block">
                        <ul className={`pl-8 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/administration/user-management">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                User Management
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/administration/integrations">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Integrations
                              </span>
                            </SidebarLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <SidebarLink href="/overview/administration/cloud-integrations">
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                                Cloud Integrations
                              </span>
                            </SidebarLink>
                          </li>
                        </ul>
                      </div>
                    </>
                  )
                }}
              </SidebarLinkGroup>
              {/* Settings */}
              <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${segments.includes('settings') && 'from-indigo-600/[0.12] dark:from-indigo-600/[0.24] to-indigo-600/[0.04]'}`}>
                <SidebarLink href="/overview/settings">
                  <div className="flex items-center">
                    <Icon name="person-circle-outline" className={`text-base flex-shrink-0 ${segments.includes('settings') ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 xl:opacity-100 duration-200">
                      Profile Settings
                    </span>
                  </div>
                </SidebarLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex xl:hidden justify-end mt-auto px-4">
          <div className="w-12 pl-4 pr-3 py-2">
            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <Icon
                name="chevron-back-outline"
                className="inline shrink-0 text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180 w-4 h-4"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}