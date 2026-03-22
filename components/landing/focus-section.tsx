import ImagePlaceholder from './image-placeholder'

export default function FocusSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-60 h-[10rem] pointer-events-none -z-10" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16" data-aos="fade-up">
            <p className="text-sm font-medium text-blue-400 mb-3 uppercase tracking-wide">For people on call</p>
            <h2 className="text-3xl md:text-5xl font-uncut-sans mb-4">
              Made for long nights,<br className="hidden sm:block" /> not for a keynote
            </h2>
            <p className="text-base text-gray-400 leading-relaxed">
              Same screens, same muscle memory. So when the pager goes off, you're not learning a new UI under stress.
            </p>
          </div>

          <div className="w-full" data-aos="zoom-out">
            <ImagePlaceholder
              label="Wide still (16:9)"
              description="Realistic shot: two screens with triage + timeline, maybe a dim SOC in the background. Should feel like work, not a stock photo of hands typing."
              minHeight="min-h-[360px] md:min-h-[420px]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
