"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import Link from "next/link"
import api, { type Category, type CategoriesResponse } from "@/lib/api"
import { useRouter } from "next/navigation"
import SocialMediaIcons from "./social-media-icons"
import { Button } from "./ui/button"

interface NavigationBarProps {
  onCategorySelect?: (categoryId: string) => void
}

export function NavigationBar({ onCategorySelect }: NavigationBarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const desktopDropdownRef = useRef<HTMLDivElement>(null)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("NavigationBar: Fetching categories...")
        const data: CategoriesResponse | Category[] = await api.getCategories()
        console.log("NavigationBar: Received categories data:", data)
        
        if (Array.isArray(data)) {
          setCategories(data)
          console.log("NavigationBar: Set categories (direct array):", data.length, "items")
        } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as CategoriesResponse).results)) {
          setCategories((data as CategoriesResponse).results)
          console.log("NavigationBar: Set categories (from results):", (data as CategoriesResponse).results.length, "items")
        } else {
          console.error("NavigationBar: Unexpected categories API response format:", data)
          setCategories([])
        }
      } catch (error) {
        console.error("NavigationBar: Failed to fetch categories:", error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  // Click outside handler for desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node)) {
        setIsDesktopDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Click outside handler for mobile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    console.log("NavigationBar: handleCategoryClick called with categoryId:", categoryId)
    
    // Close all dropdowns and menus
    setIsDesktopDropdownOpen(false)
    setIsMobileDropdownOpen(false)
    setIsMobileMenuOpen(false)
    
    // Call the callback if provided
    if (onCategorySelect) {
      onCategorySelect(categoryId)
    }
    
    // Navigate to category page
    try {
      console.log("NavigationBar: Navigating to /category/" + categoryId)
      router.push(`/category/${categoryId}`)
    } catch (error) {
      console.error("NavigationBar: Navigation error:", error)
      // Fallback to window.location if router fails
      window.location.href = `/category/${categoryId}`
    }
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false) // Close mobile menu on any link click
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm lg:mt-[100px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-between py-3">
          {/* Left side - Categories */}
          <div className="flex items-center space-x-8 overflow-x-auto">
            {/* Categories Dropdown */}
            <div className="relative" ref={desktopDropdownRef}>
              <button 
                onClick={() => setIsDesktopDropdownOpen(!isDesktopDropdownOpen)}
                onMouseEnter={() => setIsDesktopDropdownOpen(true)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors px-6 py-3 rounded-md hover:bg-gray-100 text-base font-medium whitespace-nowrap"
              >
                <span>Kateqoriyalar</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDesktopDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDesktopDropdownOpen && (
                <div 
                  className="fixed top-40 left-8 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl z-[99999]"
                  onMouseLeave={() => setIsDesktopDropdownOpen(false)}
                >
                  <div className="py-2 max-h-80 overflow-y-auto">
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            console.log("NavigationBar: Desktop category clicked:", category.name, "ID:", category.id)
                            handleCategoryClick(category.id.toString())
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {category.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <span className="text-sm text-gray-500">Kateqoriyalar yüklənir...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bestsellers */}
            <Link 
              href="/bestsellers" 
              className="text-gray-700 hover:text-blue-600 transition-colors px-6 py-3 rounded-md hover:bg-gray-100 text-base font-medium whitespace-nowrap"
            >
              Ən Çox Satılan
            </Link>

            {/* New Books */}
            <Link 
              href="/new-books" 
              className="text-gray-700 hover:text-blue-600 transition-colors px-6 py-3 rounded-md hover:bg-gray-100 text-base font-medium whitespace-nowrap"
            >
              Yeni Kitablar
            </Link>

            {/* Discounts */}
            <Link 
              href="/discounts" 
              className="text-gray-700 hover:text-blue-600 transition-colors px-6 py-3 rounded-md hover:bg-gray-100 text-base font-medium whitespace-nowrap"
            >
              Endirimlər
            </Link>
          </div>

          {/* Right side - Social Media Icons */}
          <div className="flex items-center space-x-3">
            <SocialMediaIcons variant="navbar" />
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between py-3">
            {/* Mobile Categories Button */}
            <div className="relative" ref={mobileDropdownRef}>
              <button 
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-medium"
              >
                <span>Kateqoriyalar</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobileDropdownOpen && (
                <div className="absolute top-[60px] left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
                  <div className="py-2 max-h-60 overflow-y-auto">
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            console.log("NavigationBar: Mobile category clicked:", category.name, "ID:", category.id)
                            handleCategoryClick(category.id.toString())
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {category.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <span className="text-xs text-gray-500">Kateqoriyalar yüklənir...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 py-3 space-y-2">
              <Link 
                href="/bestsellers" 
                onClick={handleLinkClick}
                className="block px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Ən Çox Satılan
              </Link>
              <Link 
                href="/new-books" 
                onClick={handleLinkClick}
                className="block px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Yeni Kitablar
              </Link>
              <Link 
                href="/discounts" 
                onClick={handleLinkClick}
                className="block px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Endirimlər
              </Link>
              
              {/* Mobile Social Media Icons */}
              <div className="pt-2 border-t border-gray-200">
                <div className="px-4">
                  <SocialMediaIcons variant="navbar" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 