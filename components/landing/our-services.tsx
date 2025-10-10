'use client'

import { useState } from 'react'

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
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <ion-icon name={service.icon} class="text-xl text-blue-500"></ion-icon>
                        </div>
                        <span className="font-uncut-sans text-base text-gray-100 font-medium">
                          {service.title}
                        </span>
                      </div>
                      <ion-icon 
                        name="chevron-down-outline" 
                        class={`text-xl text-gray-400 transition-transform duration-200 ${expandedItem === index ? 'rotate-180' : ''}`}
                      ></ion-icon>
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
