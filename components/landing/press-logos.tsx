import Icon from '@/components/ui/icon'

const placeholders = ['Finance', 'Healthcare', 'Energy', 'Software', 'Public sector']

export default function PressLogos() {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-16 border-y border-gray-800">
          <div className="text-center mb-10" data-aos="fade-up">
            <p className="text-sm font-medium text-blue-400 mb-2 uppercase tracking-wide">Organizations we work with</p>
            <h2 className="text-2xl md:text-3xl font-uncut-sans text-gray-100">Teams who trust us with their security</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-2xl mx-auto">
              Drop your customer logos in here when you can. Mixed industries is fine. We’ll keep the spacing even so it looks
              intentional.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {placeholders.map((label, i) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 bg-gray-900/50 py-8 px-3 text-center hover-lift transition-colors hover:border-gray-600"
                data-aos="fade-up"
                data-aos-delay={80 + i * 60}
              >
                <Icon name="business-outline" className="w-8 h-8 text-gray-600" />
                <span className="text-xs text-gray-500 leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
