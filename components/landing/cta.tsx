import ImagePlaceholder from './image-placeholder'

export default function Cta() {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative cta-banner-animate rounded-lg py-12 px-8 md:py-16 md:px-12 overflow-hidden" data-aos="zoom-out">
          <div className="relative z-10 text-center lg:text-left lg:max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-uncut-sans mb-3 text-white">You need this. Right now.</h3>
              <p className="text-base text-blue-100/95">
                Too many alerts, slow handoffs, audit panic. One place to see what's going on and fix it. Scroll up and drop
                us a line when you're ready.
              </p>
              <p className="text-sm text-blue-200/80 mt-4">Plain language. No hard sell. We reply within a business day. Or two.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
