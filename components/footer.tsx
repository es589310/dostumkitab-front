"use client"

import React, { memo, useEffect } from 'react'
import Link from 'next/link'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import SocialMediaIcons from './social-media-icons'

export const Footer = memo(function Footer() {
  const { settings, loading: settingsLoading } = useSiteSettings()

  // Track site settings data
  useEffect(() => {
    console.log('Footer: Site settings updated:', settings)
    if (settings) {
      console.log('Footer: Navbar logo URL:', settings.navbar_logo_imagekit_url)
      console.log('Footer: Footer logo URL:', settings.footer_logo_imagekit_url)
      console.log('Footer: Navbar logo file:', settings.navbar_logo)
      console.log('Footer: Footer logo file:', settings.footer_logo)
    }
  }, [settings])

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left section - Logo and information */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                {settingsLoading ? (
                  <div className="h-[39px] w-[250px] bg-gray-700 animate-pulse rounded"></div>
                ) : settings?.footer_logo_imagekit_url ? (
                  <img
                    src={settings.footer_logo_imagekit_url}
                    alt={settings.site_name || "KitabSat Logo"}
                    className="h-[39px] w-[250px] object-contain"
                    onError={(e) => {
                      console.log('Footer logo failed to load, using default')
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : settings?.footer_logo ? (
                  <img
                    src={settings.footer_logo}
                    alt={settings.site_name || "KitabSat Logo"}
                    className="h-[39px] w-[250px] object-contain"
                    onError={(e) => {
                      console.log('Footer logo failed to load, using default')
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : (
                  <div className="h-[39px] w-[250px] bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {settings?.site_name || "dostumkitab.az"}
                    </span>
                  </div>
                )}
              </Link>
            </div>
            
            <p className="text-gray-300 mb-4 max-w-md">
              {settings?.site_description || "Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti."}
            </p>
            
            {/* Ünvan və iş saatları */}
            {settings?.address && (
              <div className="flex items-start text-sm text-gray-300 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{settings.address}</span>
              </div>
            )}
            
            {settings?.working_hours && (
              <div className="flex items-start text-sm text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span>{settings.working_hours}</span>
              </div>
            )}
            
            <div className="flex space-x-4">
              <div className="flex items-center text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <a 
                  href={`tel:${settings?.phone || "+994 12 345 67 89"}`}
                  className="hover:text-white transition-colors"
                >
                  {settings?.phone || "+994 12 345 67 89"}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <a 
                  href={`mailto:${settings?.email || "info@faziletkitab.az"}`}
                  className="hover:text-white transition-colors"
                >
                  {settings?.email || "info@faziletkitab.az"}
                </a>
              </div>
            </div>

            {settings?.whatsapp_number && (
              <div className="flex items-center text-sm text-gray-300 mt-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                  <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.099-.471-.15-.67.15-.197.3-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.49 3.488"/>
                </svg>
                <a 
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  title="WhatsApp-da yazın"
                >
                  {settings.whatsapp_number}
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sürətli Keçidlər</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Ana Səhifə
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Kateqoriyalar
                </Link>
              </li>
              <li>
                <Link href="/bestsellers" className="hover:text-white transition-colors">
                  Ən Çox Satılan
                </Link>
              </li>
              <li>
                <Link href="/new-books" className="hover:text-white transition-colors">
                  Yeni Kitablar
                </Link>
              </li>
              <li>
                <Link href="/discounts" className="hover:text-white transition-colors">
                  Endirimlər
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Müştəri Xidməti</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Əlaqə
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Çatdırılma
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Qaytarma
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  TVS
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Dəstək
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sosial Media</h3>
            <SocialMediaIcons variant="footer" />
            <p className="text-sm text-gray-400 mt-4">
              Bizi sosial mediada izləyin və yeniliklərdən xəbərdar olun
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {settings?.copyright_year || 2024} {settings?.site_name || "Fəzilət Kitab"}. Bütün hüquqlar qorunur.</p>
        </div>
      </div>
    </footer>
  )
})