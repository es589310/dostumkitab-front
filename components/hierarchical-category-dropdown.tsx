"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import api, { type Category } from "@/lib/api"
import { useRouter } from "next/navigation"

interface HierarchicalCategoryDropdownProps {
  onCategorySelect?: (categoryId: string) => void
}

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}

export function HierarchicalCategoryDropdown({ onCategorySelect }: HierarchicalCategoryDropdownProps) {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)
  const [hoveredSubCategory, setHoveredSubCategory] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("HierarchicalCategoryDropdown: Fetching categories...")
        const data = await api.getCategories()
        
        if (Array.isArray(data)) {
          setCategories(data)
          console.log("HierarchicalCategoryDropdown: Set categories:", data.length, "items")
        } else if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) {
          setCategories(data.results)
          console.log("HierarchicalCategoryDropdown: Set categories from results:", data.results.length, "items")
        } else {
          console.error("HierarchicalCategoryDropdown: Unexpected categories API response format:", data)
          setCategories([])
        }
      } catch (error) {
        console.error("HierarchicalCategoryDropdown: Failed to fetch categories:", error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHoveredCategory(null)
        setHoveredSubCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    console.log("HierarchicalCategoryDropdown: Category clicked:", categoryName, "ID:", categoryId)
    if (onCategorySelect) {
      onCategorySelect(categoryId)
    }
    router.push(`/category/${categoryId}`)
    setIsOpen(false)
    setHoveredCategory(null)
    setHoveredSubCategory(null)
  }

  const handleMouseEnter = (categoryId: number) => {
    setHoveredCategory(categoryId)
    setHoveredSubCategory(null)
  }

  const handleMouseLeave = () => {
    setHoveredCategory(null)
    setHoveredSubCategory(null)
  }

  const handleSubCategoryMouseEnter = (subCategoryId: number) => {
    setHoveredSubCategory(subCategoryId)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors px-6 py-3 rounded-md hover:bg-gray-100 text-base font-medium whitespace-nowrap"
      >
        <span>Kateqoriyalar</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div 
          className="fixed top-40 left-8 w-[1200px] bg-white border border-gray-200 rounded-lg shadow-2xl z-[99999]"
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-6">
            <div className="grid grid-cols-4 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="space-y-2">
                  {/* 1-ci mərhələ - Ana kateqoriya */}
                  <div
                    onMouseEnter={() => handleMouseEnter(category.id)}
                    className="cursor-pointer"
                  >
                    <Link
                      href={`/category/${category.id}`}
                      onClick={() => handleCategoryClick(category.id.toString(), category.name)}
                      className="block px-3 py-2 text-sm font-semibold text-gray-900 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      {category.name}
                    </Link>
                  </div>

                  {/* 2-ci mərhələ - Alt kateqoriyalar */}
                  {hoveredCategory === category.id && category.children && category.children.length > 0 && (
                    <div className="space-y-1 ml-4">
                      {category.children.map((subCategory) => (
                        <div key={subCategory.id} className="space-y-1">
                          <div
                            onMouseEnter={() => handleSubCategoryMouseEnter(subCategory.id)}
                            className="cursor-pointer"
                          >
                            <Link
                              href={`/category/${subCategory.id}`}
                              onClick={() => handleCategoryClick(subCategory.id.toString(), subCategory.name)}
                              className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              {subCategory.name}
                            </Link>
                          </div>

                          {/* 3-cü mərhələ - Alt-alt kateqoriyalar */}
                          {hoveredSubCategory === subCategory.id && subCategory.children && subCategory.children.length > 0 && (
                            <div className="space-y-1 ml-4">
                              {subCategory.children.map((subSubCategory) => (
                                <Link
                                  key={subSubCategory.id}
                                  href={`/category/${subSubCategory.id}`}
                                  onClick={() => handleCategoryClick(subSubCategory.id.toString(), subSubCategory.name)}
                                  className="block px-3 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                >
                                  {subSubCategory.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
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
  )
}