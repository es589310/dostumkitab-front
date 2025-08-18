"use client"

import { useEffect, useState } from "react"
import { AuthModal } from "@/components/auth-modal"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import api from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function ContactPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    api.getSiteSettings()
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Contact: Error loading settings:", err)
        setLoading(false)
      })
  }, [])

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      console.log('Contact form - isAuthenticated:', isAuthenticated)
      console.log('Contact form - user:', user)
      
      const submitData = isAuthenticated 
        ? {
            subject: formData.subject,
            message: formData.message
            // Giriş olan istifadəçilər üçün name və email göndərilmir
          }
        : {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }

      console.log('Sending contact message:', submitData)

      const response = await api.sendContactMessage(submitData)
      
      if (response.success) {
        setSubmitMessage({ type: 'success', text: response.message })
        // Formu təmizlə
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        setSubmitMessage({ type: 'error', text: response.message || 'Xəta baş verdi' })
      }
    } catch (error: any) {
      console.error('Contact form error:', error)
      
      // 429 xətası üçün xüsusi mesaj
      if (error.message && error.message.includes('429')) {
        setSubmitMessage({ 
          type: 'error', 
          text: 'Çox tez-tez mesaj göndərirsiniz. Zəhmət olmasa bir az gözləyin və yenidən cəhd edin.' 
        })
      } else {
        setSubmitMessage({ 
          type: 'error', 
          text: error.message || 'Mesaj göndərilərkən xəta baş verdi' 
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <main className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Yüklənir...</p>
              </div>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">         
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Əlaqə</h1>
              <p className="text-lg text-gray-600">
                Bizimlə əlaqə saxlayın. Sual və təkliflərinizi gözləyirik.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Əlaqə məlumatları */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-6">Əlaqə Məlumatları</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Telefon</h3>
                      <a 
                        href={`tel:${settings?.phone || "+994 12 345 67 89"}`}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {settings?.phone || "+994 12 345 67 89"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">E-mail</h3>
                      <a 
                        href={`mailto:${settings?.email || "info@faziletkitab.az"}`}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {settings?.email || "info@faziletkitab.az"}
                      </a>
                    </div>
                  </div>

                  {settings?.address && (
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Ünvan</h3>
                        <p className="text-gray-600">{settings.address}</p>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors text-sm mt-1 inline-flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Xəritədə göstər
                        </a>
                      </div>
                    </div>
                  )}

                  {settings?.working_hours && (
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">İş Saatları</h3>
                        <p className="text-gray-600">{settings.working_hours}</p>
                      </div>
                    </div>
                  )}

                  {settings?.whatsapp_number && (
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.099-.471-.15-.67.15-.197.3-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.49 3.488"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                        <a 
                          href={`https://wa.me/${settings.whatsapp_number.replace(/\s/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          title="WhatsApp-da yazın"
                        >
                          {settings.whatsapp_number}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Əlaqə formu */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-6">Mesaj Göndərin</h2>
                
                {/* Submit mesajı */}
                {submitMessage && (
                  <div className={`mb-6 p-4 rounded-md ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Ad Soyad sahəsi - yalnız giriş olmayan istifadəçilər üçün */}
                  {!isAuthenticated && (
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Adınızı və soyadınızı daxil edin"
                      />
                    </div>
                  )}

                  {/* E-mail sahəsi - yalnız giriş olmayan istifadəçilər üçün */}
                  {!isAuthenticated && (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="E-mail ünvanınızı daxil edin"
                      />
                    </div>
                  )}

                  {/* Giriş olan istifadəçilər üçün məlumat göstərilməsi */}
                  {isAuthenticated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Giriş edilmiş istifadəçi:</strong> {user?.first_name} {user?.last_name} ({user?.email})
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Mövzu *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mesajınızın mövzusunu daxil edin"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mesajınızı daxil edin"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-md font-semibold transition duration-300 ${
                      isSubmitting
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? 'Göndərilir...' : 'Mesaj Göndər'}
                  </button>
                </form>
              </div>
            </div>
          </main>

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            mode={authMode}
            onModeChange={setAuthMode}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  )
} 