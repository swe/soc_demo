import Image from 'next/image'

import Icon from '@/components/ui/icon'

import Illustration from '@/public/images/hero-illustration.svg'

import ImagePlaceholder from './image-placeholder'

const bullets = [
  { text: 'Alerts, incidents, and open vulns. All in one place, no tab-hopping.', icon: 'notifications-outline' as const },
  { text: 'A clear picture for your team and for leadership', icon: 'analytics-outline' as const },
  { text: 'Hunting and intel where your analysts already work', icon: 'search-outline' as const },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: '620px' }}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-800 to-gray-900 opacity-60 h-[10rem] pointer-events-none"
        aria-hidden
        style={{ zIndex: -2 }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none top-0"
        aria-hidden
        style={{ zIndex: -1, opacity: 0.35 }}
      >
        <Image src={Illustration} className="max-w-none animate-float" priority alt="" style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-36 pb-20 md:pt-44 md:pb-28">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center lg:gap-16 gap-10">
            <div className="lg:w-1/2 text-center lg:text-left" data-aos="zoom-out" data-aos-delay="100">
              <p className="text-sm font-medium text-blue-400 mb-4 uppercase tracking-wide">Heimdall · SOC portal</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-uncut-sans mb-6 leading-tight">
                Know what&apos;s going on. <em className="font-italic text-blue-200">Respond faster.</em>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                Your team shouldn&apos;t live in five browser tabs during an incident. Heimdall pulls the work into one place so
                you can see it, assign it, and close it.
              </p>

              <ul className="text-base text-gray-300 mb-10 space-y-4 max-w-xl mx-auto lg:mx-0">
                {bullets.map((b, i) => (
                  <li
                    key={b.text}
                    className="flex items-start gap-3 justify-center lg:justify-start"
                    data-aos="fade-up"
                    data-aos-delay={150 + i * 80}
                  >
                    <Icon name={b.icon} className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  className="btn text-white bg-linear-to-t from-blue-600 to-blue-400 hover:to-blue-500 w-full sm:w-auto shadow-lg group text-center hover-scale active:scale-[0.98]"
                  href="#contact-form"
                >
                  Let&apos;s talk
                  <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
                    →
                  </span>
                </a>
                <a
                  className="btn text-white bg-linear-to-t from-gray-800 to-gray-700 hover:to-gray-800 w-full sm:w-auto shadow-lg text-center hover-scale active:scale-[0.98]"
                  href="/overview"
                >
                  See the demo
                </a>
              </div>

              <p className="mt-8 text-sm text-gray-500 max-w-md mx-auto lg:mx-0">
                No pressure. We&apos;ll tell you honestly if this isn&apos;t the right fit.
              </p>
            </div>

            <div className="lg:w-1/2 w-full" data-aos="zoom-out" data-aos-delay="200">
              <ImagePlaceholder
                label="Product screenshot"
                description="Your real overview screen here: open work, what’s noisy, what's on fire. Sanitized, same look you run in prod."
                minHeight="min-h-[340px] md:min-h-[380px]"
              />
            </div>
          </div>

          <div className="mt-14 md:hidden">
            <ImagePlaceholder
              label="Tablet view (optional)"
              description="Alert plus timeline on a tablet. Handy for managers on a bridge call."
              minHeight="min-h-[200px]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
