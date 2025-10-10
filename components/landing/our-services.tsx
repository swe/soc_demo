'use client'

import { useState } from 'react'

// Simple icon component
const ServiceIcon = ({ name }: { name: string }) => {
  // Map icon names to SVG paths
  const iconPaths: { [key: string]: string } = {
    'analytics-outline': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    'finger-print-outline': 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4',
    'bug-outline': 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
    'pulse-outline': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    'checkmark-done-outline': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'shield-checkmark-outline': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'eye-outline': 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
  }

  const path = iconPaths[name] || iconPaths['analytics-outline'] // default fallback

  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  )
}

export default function OurServices() {
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  const services = [
    {
      title: "Analytical Reports",
      description: "Detailed analysis of cyber threats with current information about new attacks, methods and tactics of attackers.",
      icon: "analytics-outline"
    },
    {
      title: "Cyber Attack Attribution",
      description: "Determining sources and authors of cyber attacks using advanced analysis methods and machine learning.",
      icon: "finger-print-outline"
    },
    {
      title: "Vulnerability Monitoring",
      description: "Continuous tracking of new vulnerabilities in software and security systems.",
      icon: "bug-outline"
    },
    {
      title: "Exploit Monitoring",
      description: "Detection and analysis of active exploits in the wild to prevent attacks.",
      icon: "pulse-outline"
    },
    {
      title: "Update Testing",
      description: "Security testing of software updates before deployment.",
      icon: "checkmark-done-outline"
    },
    {
      title: "Brand Protection",
      description: "Monitoring your brand usage in cyberspace and protection against abuse.",
      icon: "shield-checkmark-outline"
    },
    {
      title: "Darknet Monitoring",
      description: "Tracking activity in the darknet to identify threats and data leaks.",
      icon: "eye-outline"
    }
  ]

  const toggleExpanded = (index: number) => {
    if (expandedItem === index) {
      setExpandedItem(null) // Close if already open
    } else {
      setExpandedItem(index) // Open new one (closes previous)
    }
  }

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Full width header */}
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-uncut-sans mb-8">Our Services</h2>
            <p className="text-base text-gray-400 max-w-4xl">
              Svalbard Intelligence provides fast and comprehensive cyber threat information through an intuitive interface or API. Our platform delivers real-time intelligence on emerging threats, vulnerabilities, and attack patterns to help organizations stay ahead of cybercriminals. With advanced analytics and machine learning capabilities, we transform raw threat data into actionable insights that enable proactive security measures.
            </p>
          </div>

          {/* Two column layout: Image and Services */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left side - Image */}
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] bg-gray-900 rounded-2xl overflow-hidden">
                <img 
                  src="/images/soc_services.png" 
                  alt="SOC Services" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Right side - Services list */}
            <div>
              
              {/* Services list - more compact */}
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer"
                    onClick={() => toggleExpanded(index)}
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-500">
                          <ServiceIcon name={service.icon} />
                        </div>
                        <span className="font-uncut-sans text-base text-gray-100 font-medium">
                          {service.title}
                        </span>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedItem === index ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {/* Expanded content */}
                    {expandedItem === index && (
                      <div className="mt-2 p-4 bg-gray-800/30 rounded-xl">
                        <p className="text-gray-300 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
