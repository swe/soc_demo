'use client'

import { useState } from 'react'

export default function OurServices() {
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  const services = [
    {
      title: "Analytical Reports",
      description: "Detailed analysis of cyber threats with current information about new attacks, methods and tactics of attackers."
    },
    {
      title: "Cyber Attack Attribution",
      description: "Determining sources and authors of cyber attacks using advanced analysis methods and machine learning."
    },
    {
      title: "Vulnerability Monitoring",
      description: "Continuous tracking of new vulnerabilities in software and security systems."
    },
    {
      title: "Exploit Monitoring",
      description: "Detection and analysis of active exploits in the wild to prevent attacks."
    },
    {
      title: "Update Testing",
      description: "Security testing of software updates before deployment."
    },
    {
      title: "Brand Protection",
      description: "Monitoring your brand usage in cyberspace and protection against abuse."
    },
    {
      title: "Darknet Monitoring",
      description: "Tracking activity in the darknet to identify threats and data leaks."
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
                          <svg className="w-4 h-4 fill-blue-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.4 0 0 5.4 0 12c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.2-.7 0-.7 0-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4C17.3 4.6 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.4 18.6 0 12 0Z" fillRule="nonzero" />
                          </svg>
                        </div>
                        <span className="font-uncut-sans text-base text-gray-100 font-medium">
                          {service.title}
                        </span>
                      </div>
                      <svg 
                        className={`w-5 h-5 fill-gray-400 transition-transform duration-200 flex-shrink-0 ${expandedItem === index ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
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
