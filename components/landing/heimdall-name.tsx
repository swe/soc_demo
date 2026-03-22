import Icon from '@/components/ui/icon'

export default function HeimdallName() {
  return (
    <section className="border-y border-gray-800/80 bg-gray-950/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-3xl" data-aos="fade-up">
          <p className="text-sm font-medium text-blue-400 mb-3 uppercase tracking-wide">Why Heimdall</p>
          <h2 className="text-3xl md:text-4xl font-uncut-sans text-gray-100 mb-6">
            Named after the watcher of the gods
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            In Norse and Germanic mythology, Heimdallr (Heimdall) stands at the gates of Asgard, guarding Bifröst, the
            bridge between worlds. He sees for hundreds of leagues, hears grass growing on the earth, and sleeps less than a bird.
            When danger approaches, he sounds the Gjallarhorn so the gods know it&apos;s time to act.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed">
            We named our SOC portal after him because that&apos;s the job: watch, sense, and alert. One place where your team
            sees what matters and can respond before it spreads.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
            <Icon name="eye-outline" className="w-5 h-5 text-blue-400/80" />
            <span>Heimdall · the one who sees clearly</span>
          </div>
        </div>
      </div>
    </section>
  )
}
