"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Search, Menu, X, User, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useCart } from '@/contexts/cart-context'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import SocialMediaIcons from './social-media-icons'

import { AuthModal } from './auth-modal'
import { MobileCategoryAccordion } from './mobile-category-accordion'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Default settings for when loading or no data
  const defaultSettings = {
    site_name: "dostumkitab.az",
    navbar_logo_imagekit_url: "",
    navbar_logo: "",
    footer_logo_imagekit_url: "",
    footer_logo: ""
  }

  // Use settings or default values
  const currentSettings = settings || defaultSettings

  // Track cart count updates
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Header: Cart total items updated:', totalItems)
    }
  }, [totalItems])

  // Click outside handler for user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        console.log('Click outside detected, closing menu')
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])



  // Track site settings data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Header: Site settings updated:', currentSettings)
      if (currentSettings) {
        console.log('Header: Navbar logo URL:', currentSettings.navbar_logo_imagekit_url)
        console.log('Header: Footer logo URL:', currentSettings.footer_logo_imagekit_url)
        console.log('Header: Navbar logo file:', currentSettings.navbar_logo)
        console.log('Header: Footer logo file:', currentSettings.footer_logo)
      }
    }
  }, [currentSettings])

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
  
  // Handle logout function
  const handleLogout = () => {
    console.log('handleLogout called')
    console.log('Current user:', user)
    try {
      logout()
      console.log('Logout function called successfully')
    } catch (error) {
      console.error('Error calling logout:', error)
    }
    setIsUserMenuOpen(false)
    console.log('Menu closed')
  }
  
  // Debug info
  if (process.env.NODE_ENV === 'development') {
    console.log('Header Debug:', {
      isAuthenticated,
      user,
      displayName,
      isUserMenuOpen
    })
  }

  return (
    <>
      {/* Top Navigation Bar - Sosial Media İkonları */}
      <div className="bg-gray-50 border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-end py-2">
            {/* Sağ tərəf - Sosial Media İkonları */}
            <div className="flex items-center">
              <SocialMediaIcons variant="navbar" />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center justify-end py-2">
            {/* Sağ tərəf - Sosial Media İkonları */}
            <div className="flex items-center">
              <SocialMediaIcons variant="navbar" />
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white shadow-sm border-b z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between h-[100px]">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  if (window.location.pathname !== '/') {
                    router.push('/')
                    setTimeout(() => {
                      window.location.reload()
                    }, 100)
                  } else {
                    window.location.reload()
                  }
                }}
                className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                title="Ana səhifəyə qayıt və saytı yenilə"
              >
                {settingsLoading ? (
                  <div className="h-[39px] w-[250px] bg-gray-200 animate-pulse rounded"></div>
                ) : currentSettings.navbar_logo_imagekit_url ? (
                  <img
                    src={currentSettings.navbar_logo_imagekit_url}
                    alt={currentSettings.site_name || "KitabSat Logo"}
                    className="h-[39px] w-[250px] object-contain"
                    onError={(e) => {
                      console.log('Navbar logo failed to load, using default')
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : currentSettings.navbar_logo ? (
                  <img
                    src={currentSettings.navbar_logo}
                    alt={currentSettings.site_name || "KitabSat Logo"}
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
                    <span className="text-gray-600 font-bold text-lg px-2 text-center">
                      {currentSettings.site_name || "dostumkitab.az"}
                    </span>
                  </div>
                )}
              </button>
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
                    className="w-full pl-6 pr-[100px] py-3 text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 placeholder:text-sm placeholder:italic"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-search="live-search"
                    data-licence="1"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 w-[100px] text-white text-sm font-medium uppercase transition-all duration-300 border-0 cursor-pointer hover:bg-[#0f3678]"
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
              {/* Cart */}
              <div className="flex items-center">
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative group p-3 rounded-full hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <div className="relative">
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
                  
                  {totalItems > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg transform scale-100 group-hover:scale-110 transition-transform duration-300">
                      {totalItems}
                    </div>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('User menu clicked, current state:', isUserMenuOpen)
                        setIsUserMenuOpen(!isUserMenuOpen)
                      }}
                      className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full shadow">
                        {displayName}
                      </span>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div 
                        ref={userMenuRef}
                        className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[99999] opacity-100"
                        style={{ 
                          position: 'absolute',
                          top: '100%',
                          right: '0',
                          marginTop: '8px',
                          width: '192px',
                          backgroundColor: 'white',
                          border: '2px solid #3b82f6',
                          borderRadius: '8px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                          zIndex: 99999,
                          display: 'block',
                          visibility: 'visible'
                        }}
                      >
                        <div className="p-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLogout();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            Çıxış
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onAuthClick("login")} className="text-sm px-3 py-2">
                      Giriş
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2"
                      onClick={() => onAuthClick("register")}
                    >
                      Qeydiyyat
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden relative">
            {/* Top Row - Menu, Logo, Auth/Cart */}
            <div className="flex items-center justify-between py-3">
              {/* Left - Mobile Menu Button */}
              <div className="flex items-center">
                <button
                  onClick={() => {
                    console.log('Mobile menu clicked, current state:', isMobileMenuOpen)
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                    console.log('Mobile menu state changed to:', !isMobileMenuOpen)
                  }}
                  className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Center - Logo */}
              <div className="flex items-center justify-start flex-1 pl-1">
                <button 
                  onClick={() => {
                    if (window.location.pathname !== '/') {
                      router.push('/')
                      setTimeout(() => {
                        window.location.reload()
                      }, 100)
                    } else {
                      window.location.reload()
                    }
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  {settingsLoading ? (
                    <div className="h-[17.4px] w-[136px] bg-gray-200 animate-pulse rounded"></div>
                  ) : currentSettings.navbar_logo_imagekit_url ? (
                    <img
                      src={currentSettings.navbar_logo_imagekit_url}
                      alt={currentSettings.site_name || "KitabSat Logo"}
                      className="h-[17.4px] w-[136px] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : currentSettings.navbar_logo ? (
                    <img
                      src={currentSettings.navbar_logo}
                      alt={currentSettings.site_name || "KitabSat Logo"}
                      className="h-[17.4px] w-[136px] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : (
                    <div className="h-[17.4px] w-[136px] bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-xs px-1 text-center">
                        {currentSettings.site_name || "dostumkitab.az"}
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {/* Right - Auth and Cart */}
              <div className="flex items-center space-x-2">
                {/* Auth Button */}
                {!isAuthenticated ? (
                  <button
                    onClick={() => onAuthClick("login")}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="h-[21px] w-[22px]" />
                  </button>
                ) : (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <User className="h-[21px] w-[22px]" />
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                        <div className="p-2">
                          <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-200 mb-2">
                            Salam, {displayName}
                          </div>
                          <button
                            onClick={() => {
                              logout()
                              setIsUserMenuOpen(false)
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            Çıxış
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cart Button */}
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <ShoppingCart className="h-[21px] w-[22px]" />
                  
                  {totalItems > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Row - Search Bar */}
            <div className="pb-3">
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
                    className="w-full pl-6 pr-[100px] py-3 text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 placeholder:text-sm placeholder:italic"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-search="live-search"
                    data-licence="1"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 w-[100px] text-white text-sm font-medium uppercase transition-all duration-300 border-0 cursor-pointer hover:bg-[#0f3678]"
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

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                
                {/* Drawer */}
                <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-blue-600 uppercase">Menyu</h2>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4 space-y-6">
                        {/* Səhifələr */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Səhifələr</h3>
                          <div className="space-y-2">
                            <Link 
                              href="/"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-3 py-3 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              Ana Səhifə
                            </Link>
                            
                            {/* Mobile Category Accordion */}
                            <MobileCategoryAccordion onCategorySelect={onCategorySelect} onClose={() => setIsMobileMenuOpen(false)} />
                          </div>
                        </div>

                        {/* Hesab */}
                        {!isAuthenticated && (
                          <div className="pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Hesab</h3>
                            <div className="space-y-3">
                              <Button 
                                variant="ghost" 
                                size="lg" 
                                onClick={() => {
                                  onAuthClick("login")
                                  setIsMobileMenuOpen(false)
                                }} 
                                className="w-full justify-start text-base px-4 py-3"
                              >
                                Giriş
                              </Button>
                              <Button 
                                size="lg" 
                                className="w-full justify-start bg-green-500 hover:bg-green-600 text-white text-base px-4 py-3"
                                onClick={() => {
                                  onAuthClick("register")
                                  setIsMobileMenuOpen(false)
                                }}
                              >
                                Qeydiyyat
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* User Info if authenticated */}
                        {isAuthenticated && user && (
                          <div className="pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Hesab</h3>
                            <div className="px-3 py-3 bg-gray-50 rounded-md">
                              <p className="text-base text-gray-900 font-medium">Salam, {user.email}</p>
                            </div>
                            <div className="mt-3">
                              <Button 
                                variant="ghost" 
                                size="lg" 
                                onClick={() => {
                                  logout()
                                  setIsMobileMenuOpen(false)
                                }} 
                                className="w-full justify-start text-base px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Çıxış
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>


    </>
  )
}

// HeaderWrapper component that includes AuthModal
export function HeaderWrapper() {
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode)
  }

  const handleSearch = (term: string) => {
    setSearchQuery(term)
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleCloseAuth = () => {
    setAuthMode(null)
  }

  const handleModeChange = (mode: "login" | "register") => {
    setAuthMode(mode)
  }

  return (
    <>
      <Header 
        onAuthClick={handleAuthClick}
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
      />
      
      {authMode && (
        <AuthModal 
          isOpen={true}
          mode={authMode} 
          onClose={handleCloseAuth}
          onModeChange={handleModeChange}
        />
      )}
    </>
  )
}
