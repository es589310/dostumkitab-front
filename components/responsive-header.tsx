"use client"

import React, { useState } from 'react'
import { Menu, X, Search, User, ShoppingCart, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useAuth } from '@/contexts/auth-context'
import { useCart } from '@/contexts/cart-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function ResponsiveHeader() {
  const { settings } = useSiteSettings()
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems, setIsCartOpen } = useCart()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Top Bar - Desktop Only */}
      <div className="hidden lg:block bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            {/* Top Links */}
            <div className="flex items-center space-x-6">
              <Link href="/digital-library" className="hover:text-blue-600 transition-colors">
                Rəqəmsal Kitabxana
              </Link>
              <Link href="/magazine-subscription" className="hover:text-blue-600 transition-colors">
                Jurnal Abunəliyi
              </Link>
            </div>

            {/* Social Media & Contact */}
            <div className="flex items-center space-x-4">
              {/* WhatsApp */}
              {settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.099-.471-.15-.67.15-.197.3-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.49 3.488"/>
                    </svg>
                  </div>
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Instagram */}
              <a href="#" className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span>Instagram</span>
              </a>

              {/* Facebook */}
              <a href="#" className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex-1 lg:flex-none lg:w-1/4 flex justify-center lg:justify-start">
              <Link href="/" className="flex items-center">
                {settings?.navbar_logo_imagekit_url ? (
                  <img
                    src={settings.navbar_logo_imagekit_url}
                    alt={settings.site_name || "Logo"}
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <div className="h-12 px-4 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-lg">
                      {settings?.site_name || "dostumkitab.az"}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="search"
                  placeholder="Axtardığınız kitab, kateqoriya və ya müəllifi yazın..."
                  className="w-full pl-4 pr-20 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 w-20 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 transition-colors"
                >
                  AXTAR
                </button>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button - Mobile */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Search className="h-6 w-6" />
              </button>

              {/* Order Tracking */}
              <div className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">Kargom <b>Haradadır?</b></span>
              </div>

              {/* User Account */}
              <div className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                <User className="w-5 h-5" />
                <span className="hidden md:block text-sm">Üzvlük <b>Əməliyyatları</b></span>
              </div>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="hidden md:block text-sm">
                  Səbətim <b>{totalItems > 0 ? `${totalItems} məhsul` : 'boş'}</b>
                </span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="lg:hidden pb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  placeholder="Axtardığınız kitab, kateqoriya və ya müəllifi yazın..."
                  className="w-full pl-4 pr-20 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 w-20 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 transition-colors"
                >
                  AXTAR
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Əlaqə Məlumatları</h3>
                
                {settings?.phone && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <a href={`tel:${settings.phone}`} className="hover:text-blue-600">
                      {settings.phone}
                    </a>
                  </div>
                )}

                {settings?.whatsapp_number && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.099-.471-.15-.67.15-.197.3-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.49 3.488"/>
                      </svg>
                    </div>
                    <a 
                      href={`https://wa.me/${settings.whatsapp_number.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600"
                    >
                      {settings.whatsapp_number}
                    </a>
                  </div>
                )}

                {settings?.email && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <a href={`mailto:${settings.email}`} className="hover:text-blue-600">
                      {settings.email}
                    </a>
                  </div>
                )}

                {settings?.address && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{settings.address}</span>
                  </div>
                )}

                {settings?.working_hours && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{settings.working_hours}</span>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Sürətli Keçidlər</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/categories" className="text-sm text-gray-600 hover:text-blue-600 py-2 px-3 bg-gray-50 rounded">
                    Kateqoriyalar
                  </Link>
                  <Link href="/bestsellers" className="text-sm text-gray-600 hover:text-blue-600 py-2 px-3 bg-gray-50 rounded">
                    Ən Çox Satılan
                  </Link>
                  <Link href="/new-books" className="text-sm text-gray-600 hover:text-blue-600 py-2 px-3 bg-gray-50 rounded">
                    Yeni Kitablar
                  </Link>
                  <Link href="/discounts" className="text-sm text-gray-600 hover:text-blue-600 py-2 px-3 bg-gray-50 rounded">
                    Endirimlər
                  </Link>
                </div>
              </div>

              {/* User Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">İstifadəçi</h3>
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Xoş gəldiniz, <b>{user?.first_name} {user?.last_name}</b>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-sm text-red-600 hover:text-red-700 py-2 px-3 bg-red-50 rounded"
                    >
                      Çıxış
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 py-2 px-3 bg-blue-50 rounded text-center">
                      Giriş
                    </Link>
                    <Link href="/register" className="text-sm text-green-600 hover:text-green-700 py-2 px-3 bg-green-50 rounded text-center">
                      Qeydiyyat
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 