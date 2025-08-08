"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
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
                </div>
              </div>

              {/* Əlaqə formu */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-6">Mesaj Göndərin</h2>
                
                <form className="space-y-6">
                  {/* Ad Soyad sahəsi - yalnız giriş olmayan istifadəçilər üçün */}
                  {!isAuthenticated && (
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Adınızı və soyadınızı daxil edin"
                      />
                    </div>
                  )}

                  {/* E-mail sahəsi - yalnız giriş olmayan istifadəçilər üçün */}
                  {!isAuthenticated && (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
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
                      Mövzu
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mesajınızın mövzusunu daxil edin"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mesajınızı daxil edin"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
                  >
                    Mesaj Göndər
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