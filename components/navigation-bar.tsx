"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import api, { type Category, type CategoriesResponse } from "@/lib/api"
import { useRouter } from "next/navigation"
import SocialMediaIcons from "./social-media-icons"

interface NavigationBarProps {
  onCategorySelect?: (categoryId: string) => void
}

export function NavigationBar({ onCategorySelect }: NavigationBarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
    router.push(`/category/${categoryId}`)
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-3">
          {/* Left side - Categories */}
          <div className="flex items-center space-x-4 md:space-x-8 overflow-x-auto">
                      {/* Categories Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onMouseEnter={() => setIsDropdownOpen(true)}
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-100 text-sm md:text-base font-medium whitespace-nowrap"
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
            className="text-gray-700 hover:text-blue-600 transition-colors px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-100 text-sm md:text-base font-medium whitespace-nowrap"
          >
            Ən Çox Satılan
          </Link>

          {/* New Books */}
          <Link 
            href="/new-books" 
            className="text-gray-700 hover:text-blue-600 transition-colors px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-100 text-sm md:text-base font-medium whitespace-nowrap"
          >
            Yeni Kitablar
          </Link>

          {/* Discounts */}
          <Link 
            href="/discounts" 
            className="text-gray-700 hover:text-blue-600 transition-colors px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-100 text-sm md:text-base font-medium whitespace-nowrap"
          >
            Endirimlər
          </Link>
          </div>

          {/* Right side - Social Media Icons */}
          <div className="hidden md:flex">
            <SocialMediaIcons variant="navbar" />
          </div>
        </nav>
      </div>
    </div>
  )
}