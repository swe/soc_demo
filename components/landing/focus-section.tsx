export default function FocusSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-60 h-[10rem] pointer-events-none -z-10" aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="text-4xl md:text-5xl font-uncut-sans mb-4">Focus on solving bigger problems</h2>
            <p className="text-base text-gray-400 mb-6 leading-relaxed">
              Speed and completeness of data is ensured through automation of all procedures and processes. In some areas of our product, we use artificial intelligence.
            </p>
          </div>

          {/* Full width black 16:9 image */}
          <div className="w-full" data-aos="zoom-out">
            <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">16:9 Process Image Placeholder</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
