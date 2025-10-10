export const metadata = {
  title: 'Home - Svalbard Intelligence',
  description: 'Page description',
}

import Hero from '@/components/hero'
import OurServices from '@/components/our-services'
import PressLogos from '@/components/press-logos'
//import Features from '@/components/features'
//import Features02 from '@/components/features-02'
import VulnerabilityManagement from '@/components/vulnerability-management'
import FocusSection from '@/components/focus-section'
//import Pricing from '@/components/pricing'
//import Testimonials from '@/components/testimonials'
//import Resources from '@/components/resources'
import ContactForm from '@/components/contact-form'
import Cta from '@/components/cta'

export default function Home() {
  return (
    <>
      <Hero />
      <OurServices />
      <PressLogos />
      <VulnerabilityManagement />
      <FocusSection />
      <ContactForm />
      <Cta />
    </>
  )
}
