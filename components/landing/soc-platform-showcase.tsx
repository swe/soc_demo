'use client'

import { useEffect, useState } from 'react'

import Icon from '@/components/ui/icon'

import ImagePlaceholder from './image-placeholder'

const slides = [
  {
    title: 'Your morning view',
    subtitle: 'What needs attention right now',
    description:
      "Open items, rough priority, who's on it. So the team starts in the same place instead of three different chats.",
    image: {
      label: 'Screenshot: overview',
      caption: 'Drop in a real overview: queues, severity, maybe a “live” strip. Use fake data if you need to.',
    },
  },
  {
    title: 'When you’re in the weeds',
    subtitle: 'One place for the story',
    description:
      "Timeline, assets, IOCs, notes. So you're not rebuilding the case from memory at handoff.",
    image: {
      label: 'Screenshot: incident / case',
      caption: 'A believable incident page: events in order, linked hosts, room for analyst notes.',
    },
  },
  {
    title: 'Hunting & intel',
    subtitle: 'Context next to the work',
    description:
      "Maps and feeds are great when they're right here, not another login you forgot the password for.",
    image: {
      label: 'Screenshot: hunt / intel',
      caption: 'Whatever you actually ship: map, table, graph. Match the product, keep data fake.',
    },
  },
  {
    title: 'Before the audit',
    subtitle: 'Proof you can hand over',
    description:
      "Reports and status in one spot. So you're not scrambling the week someone asks \"are we covered?\"",
    image: {
      label: 'Screenshot: reports',
      caption: 'Report list or compliance view: names, dates, green/amber/red. Whatever you use today.',
    },
  },
]

export default function SocPlatformShowcase() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent((i) => (i + 1) % slides.length), 6500)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-60 h-[10rem] pointer-events-none -z-10" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16" data-aos="fade-up">
          <p className="text-sm font-medium text-blue-400 mb-3 uppercase tracking-wide">A quick look around</p>
          <h2 className="text-3xl md:text-5xl font-uncut-sans text-gray-100 mb-4">
            Same screens your team<br className="hidden sm:block" /> will use every day
          </h2>
          <p className="text-gray-400 text-lg">
            Nothing flashy. Just the places people actually live when something’s on fire.
          </p>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.title} className="w-full flex-shrink-0 px-1">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch gap-10 lg:gap-14">
                  <div className="lg:w-1/2 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
                    <h3 className="text-2xl md:text-4xl font-uncut-sans text-gray-100 mb-2">{slide.title}</h3>
                    <p className="text-blue-300/90 font-medium mb-4">{slide.subtitle}</p>
                    <p className="text-gray-400 leading-relaxed">{slide.description}</p>
                  </div>
                  <div className="lg:w-1/2 order-1 lg:order-2">
                    <ImagePlaceholder label={slide.image.label} description={slide.image.caption} minHeight="min-h-[320px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-10 bg-blue-500' : 'w-2.5 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
