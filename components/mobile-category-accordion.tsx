"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Plus, Minus } from "lucide-react"
import api, { type Category } from "@/lib/api"

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}

interface MobileCategoryAccordionProps {
  onCategorySelect?: (categoryId: string) => void
  onClose: () => void
}

export function MobileCategoryAccordion({ onCategorySelect, onClose }: MobileCategoryAccordionProps) {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("MobileCategoryAccordion: Fetching categories...")
        const data = await api.getCategories()
        console.log("MobileCategoryAccordion: Received categories data:", data)

        if (Array.isArray(data)) {
          setCategories(data as CategoryWithChildren[])
          console.log("MobileCategoryAccordion: Set categories (direct array):", data.length, "items")
        } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as any).results)) {
          setCategories((data as any).results as CategoryWithChildren[])
          console.log("MobileCategoryAccordion: Set categories (from results):", (data as any).results.length, "items")
        } else {
          console.error("MobileCategoryAccordion: Unexpected categories API response format:", data)
          setCategories([])
        }
      } catch (error) {
        console.error("MobileCategoryAccordion: Failed to fetch categories:", error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCategoryClick = (categoryId: string) => {
    console.log("MobileCategoryAccordion: handleCategoryClick called with categoryId:", categoryId)
    
    // Call the callback if provided
    if (onCategorySelect) {
      onCategorySelect(categoryId)
    }
    
    // Close the mobile menu
    onClose()
  }

  const renderCategory = (category: CategoryWithChildren, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0

    return (
      <div key={category.id} className="w-full">
        {/* Category Header */}
        {hasChildren ? (
          <div 
            className={`flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer ${
              level > 0 ? 'ml-4' : ''
            }`}
            onClick={() => toggleCategory(category.id)}
          >
            <span className="uppercase">{category.name}</span>
            <div className="flex items-center space-x-1">
              {isExpanded ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </div>
          </div>
        ) : (
          <Link
            href={`/category/${category.id}`}
            onClick={() => handleCategoryClick(category.id.toString())}
            className={`flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer ${
              level > 0 ? 'ml-4' : ''
            }`}
          >
            <span className="uppercase">{category.name}</span>
          </Link>
        )}

        {/* Category Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4 space-y-1">
            {category.children!.map((child) => (
              <div key={child.id}>
                {/* 2nd Level Category */}
                {child.children && child.children.length > 0 ? (
                  <div 
                    className="flex items-center justify-between p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                    onClick={() => toggleCategory(child.id)}
                  >
                    <span className="uppercase">{child.name}</span>
                    <div className="flex items-center space-x-1">
                      {expandedCategories.has(child.id) ? (
                        <Minus className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/category/${child.id}`}
                    onClick={() => handleCategoryClick(child.id.toString())}
                    className="flex items-center justify-between p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                  >
                    <span className="uppercase">{child.name}</span>
                  </Link>
                )}

                {/* 3rd Level Categories */}
                {child.children && child.children.length > 0 && expandedCategories.has(child.id) && (
                  <div className="ml-4 space-y-1">
                    {child.children.map((subChild) => (
                      <Link
                        key={subChild.id}
                        href={`/category/${subChild.id}`}
                        onClick={() => handleCategoryClick(subChild.id.toString())}
                        className="block p-2 text-xs text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors uppercase"
                      >
                        {subChild.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <span className="text-sm text-gray-500">Kateqoriyalar yüklənir...</span>
      </div>
    )
  }

  return (
    <div className="w-full space-y-1">
      {categories.map((category) => renderCategory(category))}
    </div>
  )
}