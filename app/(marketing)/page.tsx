import ContactForm from '@/components/landing/contact-form'
import Cta from '@/components/landing/cta'
import FocusSection from '@/components/landing/focus-section'
import HeimdallName from '@/components/landing/heimdall-name'
import Hero from '@/components/landing/hero'
import OurServices from '@/components/landing/our-services'
import PressLogos from '@/components/landing/press-logos'
import SocPlatformShowcase from '@/components/landing/soc-platform-showcase'
import SocValueProps from '@/components/landing/soc-value-props'

export const metadata = {
  title: 'Heimdall · SOC portal by Svalbard',
  description:
    'One place for alerts, incidents, and follow-through. No usual tool sprawl. See the demo or get in touch; we answer in plain language.',
}

export default function Home() {
  return (
    <>
      <Hero />
      <SocValueProps />
      <HeimdallName />
      <PressLogos />
      <OurServices />
      <SocPlatformShowcase />
      <FocusSection />
      <ContactForm />
      <Cta />
    </>
  )
}
