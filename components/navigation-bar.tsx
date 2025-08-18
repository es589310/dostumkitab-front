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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    setIsDropdownOpen(false) // Close dropdown
    setIsMobileMenuOpen(false) // Close mobile menu
    router.push(`/category/${categoryId}`)
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false) // Close mobile menu on any link click
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-2 sm:py-3">
          {/* Left side - Categories */}
          <div className="hidden lg:flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 overflow-x-auto">
                      {/* Categories Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onMouseEnter={() => setIsDropdownOpen(true)}
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-100 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
            >
              <span>Kateqoriyalar</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div 
                className="fixed top-40 left-8 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl z-[99999]"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="py-2 max-h-80 overflow-y-auto">
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.id}`}
                        onClick={() => {
                          handleCategoryClick(category.id.toString())
                        }}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {category.name}
                      </Link>
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
            className="text-gray-700 hover:text-blue-600 transition-colors px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-100 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
          >
            Ən Çox Satılan
          </Link>

          {/* New Books */}
          <Link 
            href="/new-books" 
            className="text-gray-700 hover:text-blue-600 transition-colors px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-100 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
          >
            Yeni Kitablar
          </Link>

          {/* Discounts */}
          <Link 
            href="/discounts" 
            className="text-gray-700 hover:text-blue-600 transition-colors px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-100 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
          >
            Endirimlər
          </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Right side - Social Media Icons */}
          <div className="flex items-center space-x-3">
            <SocialMediaIcons variant="navbar" />
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {/* Categories Dropdown for Mobile */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                  <span>Kateqoriyalar</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="mt-2 ml-4 bg-gray-50 rounded-md overflow-hidden">
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.id}`}
                          onClick={() => {
                            handleCategoryClick(category.id.toString())
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <span className="text-sm text-gray-500">Kateqoriyalar yüklənir...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Other Navigation Links for Mobile */}
              <Link 
                href="/bestsellers" 
                onClick={handleLinkClick}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium"
              >
                Ən Çox Satılan
              </Link>

              <Link 
                href="/new-books" 
                onClick={handleLinkClick}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium"
              >
                Yeni Kitablar
              </Link>

              <Link 
                href="/discounts" 
                onClick={handleLinkClick}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium"
              >
                Endirimlər
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}