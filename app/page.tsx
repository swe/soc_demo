import './css/landing-full.css'

export const metadata = {
  title: 'Home - Svalbard Intelligence',
  description: 'Intelligent cyber threat management platform',
}

import Hero from '@/components/landing/hero'
import OurServices from '@/components/landing/our-services'
import PressLogos from '@/components/landing/press-logos'
import VulnerabilityManagement from '@/components/landing/vulnerability-management'
import FocusSection from '@/components/landing/focus-section'
import ContactForm from '@/components/landing/contact-form'
import Cta from '@/components/landing/cta'
import Header from '@/components/landing/ui/header'
import Footer from '@/components/landing/ui/footer'

export default function Home() {
  return (
    <div className="landing-wrapper">
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Header />
        <Hero />
        <OurServices />
        <PressLogos />
        <VulnerabilityManagement />
        <FocusSection />
        <ContactForm />
        <Cta />
        <Footer />
      </div>
    </div>
  )
}
