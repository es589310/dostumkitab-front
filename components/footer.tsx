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
                      console.log('ImageKit footer logo failed to load, using local logo')
                      const target = e.target as HTMLImageElement
                      if (settings?.footer_logo) {
                        // Production üçün backend API URL istifadə edirik
                        const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'
                        target.src = `${backendUrl}${settings.footer_logo}`
                      } else {
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }
                    }}
                  />
                ) : settings?.footer_logo ? (
                  <img 
                    // Production üçün backend API URL istifadə edirik
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}${settings.footer_logo}`}
                    alt={settings.site_name || "KitabSat Logo"} 
                    className="h-[39px] w-[250px] object-contain" 
                  />
                ) : (
                  <div className="h-[39px] w-[250px] bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {settings?.site_name || "Logo Yoxdur"}
                    </span>
                  </div>
                )}
              </Link>
            </div>
            
            <p className="text-gray-300 mb-4 max-w-md">
              {settings?.site_description || "Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti."}
            </p>
            
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
                  FAQ
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