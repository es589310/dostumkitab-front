"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api, { type Book, type Category, type CategoriesResponse, type BookListResponse } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Loader2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.id as string
  const [books, setBooks] = useState<Book[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { addItem, cart } = useCart()

  useEffect(() => {
    if (!categoryId) return

    console.log("CategoryPage: Loading category with ID:", categoryId)
    setLoading(true)
    setError("")
    setBooks([])

    const fetchCategoryBooks = async () => {
      try {
        console.log("CategoryPage: Fetching category data...")
        // Kategori məlumatlarını al
        const categoriesData = await api.getCategories()
        let categories: Category[] = []
        
        if (Array.isArray(categoriesData)) {
          categories = categoriesData
        } else if (categoriesData && typeof categoriesData === "object" && "results" in categoriesData && Array.isArray((categoriesData as CategoriesResponse).results)) {
          categories = (categoriesData as CategoriesResponse).results
        }

        const currentCategory = categories.find(cat => cat.id.toString() === categoryId)
        console.log("CategoryPage: Found category:", currentCategory)
        setCategory(currentCategory || null)

        // Kategoridəki kitabları alır
        console.log("CategoryPage: Fetching books for category:", categoryId)
        const res = await api.getBooks({ category: categoryId })
        if (res && Array.isArray((res as BookListResponse).results)) {
          setBooks((res as BookListResponse).results)
          console.log("CategoryPage: Loaded", (res as BookListResponse).results.length, "books")
        } else {
          setBooks([])
          console.log("CategoryPage: No books found or invalid response")
        }
      } catch (error) {
        console.error("CategoryPage: Error fetching data:", error)
        setError("Xəta baş verdi")
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryBooks()
  }, [categoryId])

  const handleAddToCart = async (book: Book) => {
    try {
      await addItem(book.id)
    } catch (error: any) {
      console.error("Səbətə əlavə edərkən xəta:", error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Kateqoriya yüklənir...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Yenidən cəhd edin
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
        {category ? `${category.name} Kitabları` : "Kateqoriya"}
      </h1>
      
      {!loading && !error && books.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Bu kateqoriyada kitab tapılmadı</div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            Ana səhifəyə qayıt
          </Link>
        </div>
      )}
      
      {books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {books.map((book) => (
            <div key={book.id} className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
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
                        <Badge className="bg-blue-500 text-white text-xs px-2 py-1 shadow-sm">
                          Ən Çox Satılan
                        </Badge>
                      )}
                      {book.is_new && (
                        <Badge className="bg-green-500 text-white text-xs px-2 py-1 shadow-sm">
                          Yeni
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Content */}
              <div className="px-3 pb-3">
                {/* Publisher */}
                <div className="text-center mb-2">
                  <Link href={`/publisher/${book.publisher?.slug || '#'}`} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    {book.publisher?.name || 'Nəşriyyat'}
                  </Link>
                </div>

                {/* Title */}
                <div className="text-center mb-2">
                  <Link href={`/book/${book.slug}`} className="block">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                  </Link>
                </div>

                {/* Author */}
                <div className="text-center mb-3">
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {book.authors.map((author) => author.name).join(", ")}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center space-x-2">
                    {book.original_price && book.original_price > book.price && (
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
                  className={`w-full h-10 text-sm font-medium transition-all duration-200 ${
                    (() => {
                      const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                      const currentQuantity = currentCartItem?.quantity || 0
                      const availableStock = book.stock_quantity - currentQuantity
                      return availableStock > 0 ? 'bg-green-600 hover:bg-green-700 hover:shadow-md' : 'bg-gray-400 cursor-not-allowed'
                    })()
                  }`}
                  onClick={() => handleAddToCart(book)}
                  disabled={(() => {
                    const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                    const currentQuantity = currentCartItem?.quantity || 0
                    const availableStock = book.stock_quantity - currentQuantity
                    return availableStock <= 0
                  })()}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {(() => {
                    const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                    const currentQuantity = currentCartItem?.quantity || 0
                    const availableStock = book.stock_quantity - currentQuantity
                    if (availableStock <= 0) {
                      return "Stokda Yoxdur"
                    }
                    return "Səbətə At"
                  })()}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 