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
import api, { type Category, type CategoriesResponse } from "@/lib/api"
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
  const [categories, setCategories] = useState<Category[]>([])
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { getTotalItems } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const totalItems = getTotalItems()

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data: CategoriesResponse | Category[] = await api.getCategories()
        if (Array.isArray(data)) {
          setCategories(data)
        } else if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) {
          setCategories(data.results)
        } else {
          console.error("Unexpected categories API response format:", data)
          setCategories([])
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchQuery.trim()) {
        router.push(`/search?query=${encodeURIComponent(searchQuery)}`)
      }
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect(categoryId)
  }

  // İstifadəçi adını və soyadını birləşdir
  const displayName = user ? `${user.first_name || user.username}${user.last_name ? ` ${user.last_name}` : ""}` : ""

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link href="/">
                <img src="/logo.png" alt="KitabSat Logo" className="h-10 w-auto" />
              </Link>
              {/* "KitabSat" mətni silindi */}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Kitab axtarın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  className="pl-10 pr-4 w-full"
                />
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-6">
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                  <span>Kateqoriyalar</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category) => (
                        <a
                          key={category.id}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handleCategoryClick(category.id.toString())
                          }}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          {category.name}
                        </a>
                      ))
                    ) : (
                      <span className="block px-3 py-2 text-sm text-gray-500">Kateqoriyalar yüklənir...</span>
                    )}
                  </div>
                </div>
              </div>
              <Link href="/bestsellers" className="text-gray-700 hover:text-blue-600 transition-colors">
                Bestsellerlər
              </Link>
              <Link href="/new-books" className="text-gray-700 hover:text-blue-600 transition-colors">
                Yeni Kitablar
              </Link>
              <Link href="/discounts" className="text-gray-700 hover:text-blue-600 transition-colors">
                Endirimlər
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Button variant="ghost" size="sm" className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-7 w-7" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span>{displayName}</span>
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
                  <Button size="sm" onClick={() => onAuthClick("register")}>
                    Qeydiyyat
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
