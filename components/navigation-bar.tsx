"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import Link from "next/link"
import api, { type Category, type CategoriesResponse } from "@/lib/api"

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}
import { useRouter } from "next/navigation"
import SocialMediaIcons from "./social-media-icons"
import { Button } from "./ui/button"
import { HierarchicalCategoryDropdown } from "./hierarchical-category-dropdown"

interface NavigationBarProps {
  onCategorySelect?: (categoryId: string) => void
}

export function NavigationBar({ onCategorySelect }: NavigationBarProps) {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log("NavigationBar: Fetching categories...")
        }
        const data: CategoriesResponse | Category[] = await api.getCategories()
        if (process.env.NODE_ENV === 'development') {
          console.log("NavigationBar: Received categories data:", data)
        }
        
        if (Array.isArray(data)) {
          setCategories(data as CategoryWithChildren[])
          if (process.env.NODE_ENV === 'development') {
            console.log("NavigationBar: Set categories (direct array):", data.length, "items")
          }
        } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as CategoriesResponse).results)) {
          setCategories((data as CategoriesResponse).results as CategoryWithChildren[])
          if (process.env.NODE_ENV === 'development') {
            console.log("NavigationBar: Set categories (from results):", (data as CategoriesResponse).results.length, "items")
          }
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
    <div className="bg-white border-b border-gray-200 shadow-sm lg:sticky lg:top-0 lg:z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center py-4" style={{ height: '70px' }}>
          {/* 1-ci mərhələ kateqoriyalar - yan-yana */}
          <div className="flex flex-row items-center space-x-4">
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id} className="relative group">
                  <Link
                    href={`/category/${category.id}`}
                    onClick={() => handleCategoryClick(category.id.toString())}
                    className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-medium whitespace-nowrap flex items-center justify-center min-w-[75px]"
                    style={{ height: '70px' }}
                  >
                    {category.name}
                  </Link>
                  
                  {/* 2-ci və 3-cü mərhələ dropdown */}
                  {category.children && category.children.length > 0 && (
                    <div className="absolute top-full left-0 min-w-96 max-w-2xl w-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 mt-1">
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          {category.children.map((subCategory) => (
                            <div key={subCategory.id} className="space-y-3">
                              <Link
                                href={`/category/${subCategory.id}`}
                                onClick={() => handleCategoryClick(subCategory.id.toString())}
                                className="block px-4 py-3 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border-b border-gray-100"
                              >
                                {subCategory.name}
                              </Link>
                              
                              {/* 3-cü mərhələ */}
                              {subCategory.children && subCategory.children.length > 0 && (
                                <div className="space-y-2 ml-3">
                                  {subCategory.children.map((subSubCategory) => (
                                    <Link
                                      key={subSubCategory.id}
                                      href={`/category/${subSubCategory.id}`}
                                      onClick={() => handleCategoryClick(subSubCategory.id.toString())}
                                      className="block px-4 py-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                      {subSubCategory.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                Kateqoriyalar yüklənir...
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Navigation - Hidden, categories now in header mobile menu */}
        <div className="lg:hidden hidden">
          <div className="flex items-center justify-center py-3">
            {/* Mobile Categories Button - Moved to header mobile menu */}
          </div>
        </div>
      </div>
    </div>
  )
} 