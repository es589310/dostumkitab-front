"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { ChevronDown, Search, Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useCart } from '@/contexts/cart-context'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { CartSidebar } from "./cart-sidebar"

interface HeaderProps {
  onAuthClick: (mode: "login" | "register") => void
  onSearch: (term: string) => void
  onCategorySelect: (categoryId: string) => void
}

export function Header({ onAuthClick, onSearch, onCategorySelect }: HeaderProps) {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const { totalItems, setIsCartOpen } = useCart()
  const { settings, loading: settingsLoading } = useSiteSettings()
  const [searchQuery, setSearchQuery] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpenLocal] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Track cart count updates
  useEffect(() => {
    console.log('Header: Cart total items updated:', totalItems)
  }, [totalItems])

  // Track site settings data
  useEffect(() => {
    console.log('Header: Site settings updated:', settings)
    if (settings) {
      console.log('Header: Navbar logo URL:', settings.navbar_logo_imagekit_url)
      console.log('Header: Footer logo URL:', settings.footer_logo_imagekit_url)
      console.log('Header: Navbar logo file:', settings.navbar_logo)
      console.log('Header: Footer logo file:', settings.footer_logo)
    }
  }, [settings])

  // Click outside handler for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])



  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchQuery.trim()) {
        router.push(`/search?query=${encodeURIComponent(searchQuery)}`)
      }
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/category/${categoryId}`)
  }

  // Combine user first name and last name
  const displayName = user ? `${user.first_name || user.username}${user.last_name ? ` ${user.last_name}` : ""}` : ""

  return (
    <>
      {/* Notification */}
      {/* Notification component was removed from imports, so this block is removed */}
      
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[100px]">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link href="/">
                {settingsLoading ? (
                  <div className="h-[39px] w-[250px] bg-gray-200 animate-pulse rounded"></div>
                ) : settings?.navbar_logo ? (
                  <img
                    src={settings.navbar_logo}
                    alt={settings.site_name || "KitabSat Logo"}
                    className="h-[39px] w-[250px] object-contain"
                    onError={(e) => {
                      console.log('Logo failed to load, using default')
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : (
                  <div className="h-[39px] w-[250px] bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-lg">
                      {settings?.site_name || "dostumkitab.az"}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  router.push(`/search?query=${encodeURIComponent(searchQuery)}`)
                }
              }} className="w-full relative">
                <div className="w-full relative">
                  <input
                    id="live-search"
                    type="search"
                    name="q"
                    placeholder="Axtardığınız kitab, kateqoriya və ya müəllifi yazın..."
                    className="w-full pl-6 pr-20 md:pr-28 py-3 text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 placeholder:text-sm placeholder:italic"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-search="live-search"
                    data-licence="1"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 w-[70px] md:w-[100px] text-white text-xs md:text-sm font-medium uppercase transition-all duration-300 border-0 cursor-pointer hover:bg-[#0f3678]"
                    style={{
                      backgroundColor: '#13459A',
                      borderRadius: '0 25px 25px 0',
                      clipPath: 'polygon(25% 0, 100% 0, 100% 55%, 100% 100%, 0% 100%)',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    id="live-search-btn"
                  >
                    AXTAR
                  </button>
                </div>
              </form>
            </div>



            {/* Right Side */}
            <div className="flex items-center space-x-8">
              {/* Cart - New beautiful cart icon */}
              <div className="flex items-center">
                <button 
                  onClick={() => setIsCartOpenLocal(true)}
                  className="relative group p-3 rounded-full hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <div className="relative">
                    {/* Simple cart icon */}
                    <svg 
                      className="w-7 h-7 text-gray-700 group-hover:text-blue-600 transition-colors duration-300"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </div>
                  
                  {/* Product count badge */}
                  {totalItems > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg transform scale-100 group-hover:scale-110 transition-transform duration-300">
                      {totalItems}
                    </div>
                  )}
                </button>
              </div>

              {/* User Menu - Ayrı div */}
              <div className="flex items-center">
                {isAuthenticated && user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full shadow">
                        {displayName}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                        <div className="p-2">
                          <button
                            onClick={logout}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            Çıxış
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onAuthClick("login")}>
                      Giriş
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => onAuthClick("register")}
                    >
                      Qeydiyyat
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpenLocal(false)} />
    </>
  )
}
