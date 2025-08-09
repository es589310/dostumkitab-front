"use client"

import { useEffect, useState, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import api from "@/lib/api"

export const Footer = memo(function Footer() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("Footer: Component mounted, fetching settings...")
    api.getSiteSettings()
      .then((data) => {
        console.log("Footer: Site settings loaded:", data)
        setSettings(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Footer: Error loading settings:", err)
        setLoading(false)
      })
  }, [])

  console.log("Footer: Rendering with settings:", settings, "loading:", loading)

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white" key="footer-loading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-gray-300">Yüklənir...</p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-900 text-white" key="footer-loaded">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sol hissə - Logo və məlumatlar */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/logo.jpg"
                alt="Fəzilət Kitab"
                className="h-[39px] w-[250px] object-contain"
              />
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

          {/* Sürətli Keçidlər */}
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

          {/* Müştəri Xidməti */}
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
        </div>

        {/* Alt hissə */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {settings?.copyright_year || 2024} {settings?.site_name || "Fəzilət Kitab"}. Bütün hüquqlar qorunur.</p>
        </div>
      </div>
    </footer>
  )
})
