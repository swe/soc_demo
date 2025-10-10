'use client'

import { useState } from 'react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  })
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (formState === 'error') {
      setFormState('idle')
      setErrorMessage('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      setFormState('success')
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
      })
      
      // Reset to idle state after 3 seconds
      setTimeout(() => {
        setFormState('idle')
      }, 3000)
    } catch (error) {
      setFormState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
    }
  }

  return (
    <section id="contact-form">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="text-4xl md:text-5xl font-uncut-sans">Get in touch with our team</h2>
            <p className="text-base text-gray-400 mt-4">Ready to enhance your cybersecurity? Let's discuss how Svalbard Intelligence can help protect your organization.</p>
          </div>
          
          {/* Contact form and placeholder */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-12 space-y-12 lg:space-y-0">
            {/* Contact form - left half */}
            <div className="lg:w-1/2">

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={formState === 'loading'}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={formState === 'loading'}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={formState === 'loading'}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      disabled={formState === 'loading'}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
                
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    disabled={formState === 'loading'}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    placeholder="Tell us about your cybersecurity needs..."
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={formState === 'loading'}
                    className={`btn text-white w-full shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out ${
                      formState === 'success' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : formState === 'error' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-linear-to-t from-blue-600 to-blue-400 hover:to-blue-500'
                    }`}
                  >
                    {formState === 'loading' ? (
                      <div className="flex items-center justify-center space-x-2">
                        <ion-icon name="reload-outline" class="text-xl text-white animate-spin"></ion-icon>
                        <span>Sending...</span>
                      </div>
                    ) : formState === 'success' ? (
                      <div className="flex items-center justify-center space-x-2">
                        <ion-icon name="checkmark-circle-outline" class="text-xl text-white"></ion-icon>
                        <span>Message Sent!</span>
                      </div>
                    ) : formState === 'error' ? (
                      <div className="flex items-center justify-center space-x-2">
                        <ion-icon name="close-circle-outline" class="text-xl text-white"></ion-icon>
                        <span>Error - Try Again</span>
                      </div>
                    ) : (
                      <>
                        Send Message{' '}
                        <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
                          →
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Black placeholder - right half */}
            <div className="lg:w-1/2">
              <div className="w-full h-full min-h-[500px] bg-black rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ion-icon name="mail-outline" class="text-4xl text-gray-400"></ion-icon>
                  </div>
                  <p className="text-gray-400 text-sm">Contact illustration placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
