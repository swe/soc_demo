import Image from 'next/image'

import Illustration from '@/public/images/hero-illustration.svg'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Bg gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-800 to-gray-900 opacity-60 h-[10rem] pointer-events-none -z-10"
        aria-hidden="true"
      />
      {/* Illustration */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none -z-10" aria-hidden="true">
        <Image src={Illustration} className="max-w-none" priority alt="Hero Illustration" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-40 pb-20 md:pt-48 md:pb-28">
          {/* Hero content */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:space-x-8 lg:space-x-16 xl:space-x-18 space-y-8 md:space-y-0">
            {/* Content */}
            <div className="md:w-7/12 lg:w-1/2 order-1 md:order-none" data-aos="zoom-out" data-aos-delay="200">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-uncut-sans mb-8" data-aos="zoom-out" data-aos-delay="100">
                  Intelligent <em className="font-italic">cyber threat</em> management platform
                </h1>
                
                {/* Mobile Image */}
                <div className="mb-6 md:hidden" data-aos="zoom-out" data-aos-delay="150">
                  <div className="w-full aspect-video bg-black rounded-lg mx-auto"></div>
                </div>

                <ul className="text-base text-gray-400 mb-10 space-y-3" data-aos="zoom-out" data-aos-delay="200">
                  <li className="flex items-center">
                    <svg className="w-3 h-3 fill-current text-emerald-500 mr-3 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>Threat analytics</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-3 h-3 fill-current text-emerald-500 mr-3 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>Vulnerability management</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-3 h-3 fill-current text-emerald-500 mr-3 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>Attack surface management</span>
                  </li>
                </ul>
                <div
                  className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mt-6"
                  data-aos="zoom-out"
                  data-aos-delay="300"
                >
                  <div>
                    <a className="btn text-white bg-linear-to-t from-blue-600 to-blue-400 hover:to-blue-500 w-full shadow-lg group" href="#contact-form">
                      Talk to Sales{' '}
                      <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
                        -&gt;
                      </span>
                    </a>
                  </div>
                  <div>
                    <a className="btn text-gray-300 bg-linear-to-t from-gray-800 to-gray-700 hover:to-gray-800 w-full shadow-lg" href="/overview">
                      View Demo
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Desktop Image */}
            <div className="md:w-5/12 lg:w-1/2 hidden md:block" data-aos="zoom-out">
              <div className="w-full aspect-video bg-black rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}