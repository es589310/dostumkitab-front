"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight, BookOpen, Star, ShoppingCart } from "lucide-react"
import api, { type Book, type Category } from "@/lib/api"
import { Button } from "@/components/ui/button"

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.id as string
  
  const [category, setCategory] = useState<CategoryWithChildren | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [booksLoading, setBooksLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true)
        if (process.env.NODE_ENV === 'development') {
          console.log("CategoryPage: Fetching category data for ID:", categoryId)
        }
        
        // Fetch category details
        const categoryData = await api.getCategory(parseInt(categoryId))
        if (process.env.NODE_ENV === 'development') {
          console.log("CategoryPage: Received category data:", categoryData)
        }
        setCategory(categoryData as CategoryWithChildren)
        
        // Fetch books for this category
        setBooksLoading(true)
        const booksData = await api.getBooksByCategory(parseInt(categoryId))
        if (process.env.NODE_ENV === 'development') {
          console.log("CategoryPage: Received books data:", booksData)
        }
        
        if (Array.isArray(booksData)) {
          setBooks(booksData)
        } else if (booksData && typeof booksData === "object" && "results" in booksData) {
          setBooks((booksData as any).results)
        } else {
          setBooks([])
        }
      } catch (error) {
        console.error("CategoryPage: Failed to fetch category data:", error)
        setCategory(null)
        setBooks([])
      } finally {
        setLoading(false)
        setBooksLoading(false)
      }
    }

    if (categoryId) {
      fetchCategoryData()
    }
  }, [categoryId])

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Kateqoriya tapılmadı</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Ana səhifəyə qayıt
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">Ana Səhifə</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 mb-4">{category.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {books.length} məhsul
            </span>
          </div>
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Alt Kateqoriyalar</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.children.map((subCategory) => (
                <Link
                  key={subCategory.id}
                  href={`/category/${subCategory.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-1">{subCategory.name}</h3>
                  <p className="text-sm text-gray-500">
                    {subCategory.books_count || 0} məhsul
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Books Section */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {category.name}
          </h2>

          {booksLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 auto-rows-fr">
              {books.map((book) => (
                <div key={book.id} className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
                  {/* Image Container */}
                  <div className="relative p-3 pb-2">
                    <Link href={`/book/${book.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg bg-gray-50">
                        <img
                          src={book.cover_imagekit_url || book.cover_image || "/placeholder.svg?height=300&width=200"}
                          alt={book.title}
                          className="w-full h-48 sm:h-52 lg:h-56 object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg?height=300&width=200";
                          }}
                        />

                        {/* Status Badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {book.is_bestseller && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                              Ən Çox Satılan
                            </span>
                          )}
                          {book.is_new && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                              Yeni
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="px-3 pb-3 flex-1 flex flex-col">
                    {/* Title */}
                    <div className="text-center mb-6 h-16 flex items-center justify-center">
                      <Link href={`/book/${book.slug}`} className="block w-full">
                        <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight hover:text-blue-600 transition-colors">
                          {book.title}
                        </h3>
                      </Link>
                    </div>

                    {/* Bottom Section - Price and Button */}
                    <div className="mt-auto">
                      {/* Price */}
                      <div className="text-center mb-3">
                        <div className="flex items-center justify-center space-x-2">
                          {book.original_price && parseFloat(book.original_price.toString()) > parseFloat(book.price.toString()) && (
                            <span className="text-xs text-gray-500 line-through">
                              {book.original_price}₼
                            </span>
                          )}
                          <span className="text-lg font-bold text-green-600">
                            {book.price}₼
                          </span>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <Button 
                        className="w-full h-10 text-sm font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 hover:shadow-md"
                        onClick={() => {
                          // Add to cart functionality
                          console.log("Add to cart:", book.id)
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Səbətə At
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bu kateqoriyada məhsul yoxdur
              </h3>
              <p className="text-gray-500">
                Tezliklə yeni məhsullar əlavə ediləcək.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}