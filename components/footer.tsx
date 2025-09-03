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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          <div className="col-span-1 sm:col-span-2">
            {/* Logo - Desktop only */}
            <div className="hidden lg:flex items-center space-x-2 mb-4">
              <button 
                onClick={() => window.location.reload()}
                className="hover:opacity-80 transition-opacity"
              >
                {settingsLoading ? (
                  <div className="h-8 w-32 sm:h-[39px] sm:w-[250px] bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-lg">Fəzilət Kitab</span>
                  </div>
                ) : settings?.footer_logo_imagekit_url ? (
                  <img
                    src={settings.footer_logo_imagekit_url}
                    alt={settings.site_name || "KitabSat Logo"}
                    className="h-8 w-32 sm:h-[39px] sm:w-[250px] object-contain"
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
                    className="h-8 w-32 sm:h-[39px] sm:w-[250px] object-contain"
                    onError={(e) => {
                      console.log('Logo failed to load, using default')
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : (
                  <div className="h-8 w-32 sm:h-[39px] sm:w-[250px] bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-lg">
                      {settings?.site_name || "Fəzilət Kitab"}
                    </span>
                  </div>
                )}
              </button>
            </div>
            
            {/* Site Description - Responsive */}
            <p className="text-gray-300 mb-4 max-w-md text-xs sm:text-sm lg:text-base leading-relaxed">
              {settings?.site_description || "Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti."}
            </p>
            
            {/* Contact Info - Responsive */}
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4">
              <div className="flex items-center text-xs sm:text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <a href={`tel:${settings?.phone || "+994 12 345 67 89"}`} className="hover:text-white transition-colors min-h-[32px] sm:min-h-[44px] flex items-center">
                  {settings?.phone || "+994 12 345 67 89"}
                </a>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <a href={`mailto:${settings?.email || "info@faziletkitab.az"}`} className="hover:text-white transition-colors min-h-[32px] sm:min-h-[44px] flex items-center">
                  {settings?.email || "info@faziletkitab.az"}
                </a>
              </div>
            </div>
            
            {/* WhatsApp Number - Responsive */}
            {settings?.whatsapp_number && (
              <div className="flex items-center text-xs sm:text-sm text-gray-300 mt-2">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
                </svg>
                <a 
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors min-h-[32px] sm:min-h-[44px] flex items-center"
                >
                  {settings.whatsapp_number}
                </a>
              </div>
            )}
          </div>
          
          {/* Quick Links - Responsive */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Sürətli Keçidlər</h3>
            <ul className="space-y-1 sm:space-y-2 text-gray-300">
              <li><a className="hover:text-white transition-colors min-h-[28px] sm:min-h-[32px] flex items-center text-xs sm:text-sm lg:text-base" href="/">Ana Səhifə</a></li>
              <li><a className="hover:text-white transition-colors min-h-[28px] sm:min-h-[32px] flex items-center text-xs sm:text-sm lg:text-base" href="/categories">Kateqoriyalar</a></li>
              <li><a className="hover:text-white transition-colors min-h-[28px] sm:min-h-[32px] flex items-center text-xs sm:text-sm lg:text-base" href="/bestsellers">Ən Çox Satılan</a></li>
              <li><a className="hover:text-white transition-colors min-h-[28px] sm:min-h-[32px] flex items-center text-xs sm:text-sm lg:text-base" href="/new-books">Yeni Kitablar</a></li>
              <li><a className="hover:text-white transition-colors min-h-[28px] sm:min-h-[32px] flex items-center text-xs sm:text-sm lg:text-base" href="/discounts">Endirimlər</a></li>
            </ul>
          </div>
          
          {/* Customer Service - Responsive */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Müştəri Xidməti</h3>
            <ul className="space-y-1 sm:space-y-2 text-gray-300">
              <li><a className="hover:text-white transition-colors min-h-[28px] sm:min-h-[32px] flex items-center text-xs sm:text-sm lg:text-base" href="/contact">Əlaqə</a></li>
              <li><a className="hover:text-white transition-colors min-h-[28px] sm:min-h-[32px] flex items-center text-xs sm:text-sm lg:text-base" href="#">Çatdırılma</a></li>
              <li><a className="hover:text-white transition-colors min-h-[28px] sm:min-h-[32px] flex items-center text-xs sm:text-sm lg:text-base" href="#">Qaytarma</a></li>
              <li><a className="hover:text-white transition-colors min-h-[28px] sm:min-h-[32px] flex items-center text-xs sm:text-sm lg:text-base" href="#">Tez-tez verilən suallar</a></li>
            </ul>
          </div>
          
          {/* Social Media - Responsive */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Sosial Media</h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3 lg:mt-4 mb-2 sm:mb-3 lg:mb-4 leading-relaxed">Bizi sosial mediada izləyin və yeniliklərdən xəbərdar olun</p>
            <SocialMediaIcons variant="footer" />
          </div>
        </div>
        
        {/* Copyright - Responsive */}
        <div className="border-t border-gray-800 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-8 text-center text-gray-400">
          <p className="text-xs sm:text-sm lg:text-base">© {settings?.copyright_year || new Date().getFullYear()} {settings?.site_name || "Fəzilət Kitab"}. Bütün hüquqlar qorunur.</p>
        </div>
      </div>
    </footer>
  )
})