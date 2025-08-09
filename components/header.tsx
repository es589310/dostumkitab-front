"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, ChevronDown } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context" // Düzgün yol
import { CartSidebar } from "./cart-sidebar"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface HeaderProps {
  onAuthClick: (mode: "login" | "register") => void
  onSearch: (term: string) => void
  onCategorySelect: (categoryId: string) => void
}

export function Header({ onAuthClick, onSearch, onCategorySelect }: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { getTotalItems, cart, notification } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const totalItems = getTotalItems()
  
  // Cart sayının yenilənməsini izlə
  useEffect(() => {
    console.log('Header: Cart total items updated:', totalItems)
  }, [totalItems, cart]) // cart state-ini də izlə

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

  // İstifadəçi adını və soyadını birləşdir
  const displayName = user ? `${user.first_name || user.username}${user.last_name ? ` ${user.last_name}` : ""}` : ""

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[100px]">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link href="/">
                <img src="/logo.jpg" alt="KitabSat Logo" className="h-[39px] w-[250px] object-contain" />
              </Link>
              {/* "KitabSat" mətni silindi */}
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
              {/* Cart - Ayrı div */}
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="relative p-2" onClick={() => setIsCartOpen(true)}>
                  <ShoppingCart className="h-12 w-12" />
                  {totalItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
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

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
