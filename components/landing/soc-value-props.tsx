import Icon from '@/components/ui/icon'

const props = [
  {
    title: 'Less tab-hopping',
    body: 'When something breaks, you’re not hunting for the right window. Alerts, cases, and follow-ups live in one workspace.',
    icon: 'hardware-chip-outline' as const,
  },
  {
    title: 'Numbers your boss will get',
    body: "Trends and backlog in plain English. So you're not building slides from scratch the night before a board meeting.",
    icon: 'analytics-outline' as const,
  },
  {
    title: 'Built for night shifts',
    body: 'Dark UI, simple paths, fewer surprises. The kind of tool you still want to use at 2 a.m.',
    icon: 'shield-checkmark-outline' as const,
  },
]

export default function SocValueProps() {
  return (
    <section className="border-y border-gray-800/80 bg-gray-900/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-3xl mb-12 md:mb-16" data-aos="fade-up">
          <p className="text-sm font-medium text-blue-400 mb-3 uppercase tracking-wide">What you get</p>
          <h2 className="text-3xl md:text-5xl font-uncut-sans text-gray-100 mb-4">
            Focus on the work.<br className="hidden sm:block" /> We’ll handle the clutter.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Your customers trust you with their data. You need a SOC surface that doesn't get in the way. So you can actually
            protect what matters.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {props.map((item, i) => (
            <div
              key={item.title}
              className="rounded-2xl bg-gray-800/40 border border-gray-700/60 p-6 md:p-8 hover-lift"
              data-aos="fade-up"
              data-aos-delay={100 + i * 100}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 mb-5">
                <Icon name={item.icon} className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-uncut-sans text-gray-100 mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
