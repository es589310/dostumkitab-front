"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import api, { type Book, type Category } from "@/lib/api"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

interface BookGridProps {
  searchTerm?: string
  categoryId?: string
  bestseller?: boolean
  isNew?: boolean
  discount?: boolean
}

export function BookGrid({
  searchTerm = "",
  categoryId = "",
  bestseller = false,
  isNew = false,
  discount = false,
}: BookGridProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(categoryId)
  const [sortBy, setSortBy] = useState("created_at")
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSearching, setIsSearching] = useState(false)

  const { addItem, cart } = useCart()
  
  // Track cart updates
  useEffect(() => {
    console.log('BookGrid: Cart updated:', cart)
    if (cart) {
      console.log('BookGrid: Total items in cart:', cart.total_items)
    }
  }, [cart])

  // Sync initial props with internal state
  useEffect(() => {
    setInternalSearchTerm(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    setSelectedCategory(categoryId)
  }, [categoryId])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchCategories()
    }
  }, [])

  // Debounce search term - 800ms gecikmə
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalSearchTerm !== debouncedSearchTerm) {
        setDebouncedSearchTerm(internalSearchTerm)
        setIsSearching(true)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [internalSearchTerm, debouncedSearchTerm])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchBooks()
    }
  }, [selectedCategory, sortBy, debouncedSearchTerm, currentPage])

  // Pagination butonlarına basdıqda scroll-u yuxarıya apar
  const scrollToBooksSection = () => {
    if (typeof window !== 'undefined') {
      // Ana səhifədəki "Bütün Kitablar" bölməsinin başlığını tap
      const allBooksSection = document.getElementById('all-books-section')
      if (allBooksSection) {
        // Bölmənin başlığına scroll et
        const titleElement = allBooksSection.querySelector('h2')
        if (titleElement) {
          // Mobil cihazlar üçün daha dəqiq scroll
          try {
            const rect = titleElement.getBoundingClientRect()
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
            const targetPosition = rect.top + scrollTop - 20 // 20px yuxarıdan boşluq
            
            window.scrollTo({
              top: Math.max(0, targetPosition), // Mənfi dəyərləri qarşısını al
              behavior: 'smooth'
            })
          } catch (error) {
            // Əgər getBoundingClientRect işləmirsə, sadə scrollIntoView istifadə et
            titleElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }
        } else {
          allBooksSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories()
      if (Array.isArray(data)) {
        setCategories(data)
      } else if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) {
        setCategories(data.results)
      } else {
        console.error("Unexpected categories API response:", data)
        setCategories([])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      setCategories([])
    }
  }

  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page: currentPage,
        ordering: sortBy === "price-low" ? "price" : sortBy === "price-high" ? "-price" : `-${sortBy}`,
      }

      if (debouncedSearchTerm) params.search = debouncedSearchTerm
      if (selectedCategory) params.category = selectedCategory

      const response = await api.getBooks(params)
      console.log("Books API response:", response)
      console.log("Books API response type:", typeof response)
      console.log("Books API response keys:", Object.keys(response || {}))
      console.log("Books API full response:", JSON.stringify(response, null, 2))

      if (response && Array.isArray(response.results)) {
        setBooks(response.results)
        setTotalPages(Math.ceil(response.count / 20))
      } else {
        console.error("Unexpected books API response format:", response)
        setBooks([])
      }
    } catch (error) {
      console.error("Failed to fetch books:", error)
      setBooks([])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInternalSearchTerm(value)
    setCurrentPage(1)
    
    // Əgər input boşdursa, dərhal axtarışı təmizlə
    if (value === '') {
      setDebouncedSearchTerm('')
      setIsSearching(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleAddToCart = async (book: Book) => {
    try {
      const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
      const currentQuantity = currentCartItem?.quantity || 0
      const availableStock = book.stock_quantity
      
      if (currentQuantity >= availableStock) {
        const remainingStock = availableStock - currentQuantity
        if (remainingStock <= 0) {
          toast({
            title: "Stokda yoxdur!",
            description: `Bu kitabdan artıq ${currentQuantity} ədəd səbətinizdə var və stokda yalnız ${availableStock} ədəd var.`,
            variant: "destructive",
          })
          return
        } else {
          toast({
            title: "Stok məhdudiyyəti!",
            description: `Bu kitabdan artıq ${currentQuantity} ədəd səbətinizdə var. Stokda yalnız ${remainingStock} ədəd qalıb.`,
            variant: "destructive",
          })
          return
        }
      }
      
      await addItem(book.id)
    } catch (error: any) {
      console.error("Səbətə əlavə edərkən xəta:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Kitablar yüklənir...</p>
      </div>
    )
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
          {/* Axtarış Input - İkonlu */}
          <div className="relative flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none z-20">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  "🔍"
                )}
              </span>
              <Input
                placeholder="Kitab, müəllif və ya kateqoriya axtarın..."
                value={internalSearchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-full bg-white focus:ring-blue-500 focus:border-blue-500 rounded-full h-10"
              />
            </div>
          </div>
          
          {/* Kateqoriya Filter */}
          <div className="w-full sm:w-48">
            <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full bg-white focus:ring-blue-500 focus:border-blue-500 rounded-full hover:bg-gray-50 h-10">
                <SelectValue placeholder="Hamısı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📚 Hamısı</SelectItem>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sıralama Filter */}
          <div className="w-full sm:w-48">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full bg-white focus:ring-blue-500 focus:border-blue-500 rounded-full hover:bg-gray-50 h-10">
                <SelectValue placeholder="Yeni Əlavələr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">🆕 Yeni Əlavələr</SelectItem>
                <SelectItem value="sales_count">🔥 Populyarlıq</SelectItem>
                <SelectItem value="views_count">👁️ Ən Çox Baxılan</SelectItem>
                <SelectItem value="price-low">💰 Qiymət (Aşağı)</SelectItem>
                <SelectItem value="price-high">💰 Qiymət (Yüksək)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 auto-rows-fr">
          {Array.isArray(books) &&
            books.map((book) => (
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
              </div>
            ))}
        </div>

        {books.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Heç bir kitab tapılmadı.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentPage(Math.max(currentPage - 1, 1))
                // Kiçik gecikmə ilə scroll et (mobil cihazlar üçün)
                setTimeout(() => scrollToBooksSection(), 100)
              }}
              disabled={currentPage === 1}
              className="px-4 py-2"
            >
              Əvvəlki
            </Button>
            <span className="flex items-center px-4 py-2">
              Səhifə {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentPage(Math.min(currentPage + 1, totalPages))
                // Kiçik gecikmə ilə scroll et (mobil cihazlar üçün)
                setTimeout(() => scrollToBooksSection(), 100)
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2"
            >
              Növbəti
            </Button>
          </div>
        )}
      </div>
    </section>
  )
} 