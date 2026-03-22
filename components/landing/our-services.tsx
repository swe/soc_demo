'use client'

import { useState } from 'react'

import Icon from '@/components/ui/icon'

import ImagePlaceholder from './image-placeholder'

const services = [
  {
    title: 'Detection & tuning help',
    description:
      'Practical rules and ideas so your team spends time on real fires, not chasing the same false alarm every week.',
    icon: 'pulse-outline' as const,
  },
  {
    title: 'When things go wrong',
    description:
      'Steps, owners, and timelines you can follow from a single laptop issue to something messier. No “figure it out yourself.”',
    icon: 'shield-checkmark-outline' as const,
  },
  {
    title: 'What to patch first',
    description:
      'Enough context to argue priorities with IT: what’s exposed, what’s noisy, what actually matters to the business.',
    icon: 'bug-outline' as const,
  },
  {
    title: 'Threat context',
    description:
      "Indicators and reporting surfaced next to the work. So hunters aren't copying hashes into another tab.",
    icon: 'eye-outline' as const,
  },
  {
    title: 'Reports that don’t hurt',
    description:
      'Summaries for leadership without a week of cut-and-paste. Audit season gets a little less painful.',
    icon: 'document-text-outline' as const,
  },
  {
    title: 'Plays nice with your stack',
    description:
      'Hook up SIEM, EDR, tickets, cloud. Heimdall stays where people already look for answers.',
    icon: 'hardware-chip-outline' as const,
  },
  {
    title: 'Onboarding that sticks',
    description:
      'We help you set up roles and workflows for how your team actually works, not a generic checklist.',
    icon: 'person-circle-outline' as const,
  },
] as const

export default function OurServices() {
  const [expandedItem, setExpandedItem] = useState<number | null>(0)

  const toggleExpanded = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index)
  }

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-16 md:py-24">
          <div className="mb-14 md:mb-20" data-aos="fade-up">
            <p className="text-sm font-medium text-blue-400 mb-3 uppercase tracking-wide">How we help</p>
            <h2 className="text-3xl md:text-5xl font-uncut-sans mb-6">What’s inside Heimdall</h2>
            <p className="text-gray-400 max-w-3xl text-lg leading-relaxed">
              Here’s the short version. Tap a row if you want a bit more detail. We'd rather be clear than clever.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="relative order-2 lg:order-1" data-aos="fade-left">
              <ImagePlaceholder
                label="Architecture sketch"
                description="Optional: simple diagram. Feeds and tools on the left, Heimdall in the middle, your teams on the right. Doesn’t need to be fancy."
                minHeight="min-h-[420px] lg:min-h-[520px]"
              />
            </div>

            <div className="order-1 lg:order-2">
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div
                    key={service.title}
                    className="group cursor-pointer"
                    onClick={() => toggleExpanded(index)}
                    data-aos="fade-right"
                    data-aos-delay={100 + index * 50}
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all duration-200 hover:translate-x-1">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                          <Icon name={service.icon} className="w-5 h-5" />
                        </div>
                        <span className="font-uncut-sans text-base text-gray-100 font-medium truncate">{service.title}</span>
                      </div>
                      <Icon
                        name="chevron-down-outline"
                        className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                          expandedItem === index ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {expandedItem === index && (
                      <div className="mt-2 p-4 bg-gray-800/30 rounded-xl">
                        <p className="text-gray-300 leading-relaxed text-sm md:text-base">{service.description}</p>
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
