"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import api, { type Book } from "@/lib/api"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export function FeaturedBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem, cart } = useCart()
  
  // Track cart updates
  useEffect(() => {
    console.log('FeaturedBooks: Cart updated:', cart)
    if (cart) {
      console.log('FeaturedBooks: Total items in cart:', cart.total_items)
    }
  }, [cart])

  const handleAddToCart = async (book: Book) => {
    try {
      // Stock check - how many of this book are already in cart
      const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
      const currentQuantity = currentCartItem?.quantity || 0
      const availableStock = book.stock_quantity
      
      // If this book is already in cart and stock limit is reached
      if (currentQuantity >= availableStock) {
        // Show stock information
        const remainingStock = availableStock - currentQuantity
        if (remainingStock <= 0) {
          // No stock available
          toast({
            title: "Stokda yoxdur!",
            description: `Bu kitabdan artıq ${currentQuantity} ədəd səbətinizdə var və stokda yalnız ${availableStock} ədəd var.`,
            variant: "destructive",
          })
          return
        } else {
          // Limited stock available
          toast({
            title: "Stok məhdudiyyəti!",
            description: `Bu kitabdan artıq ${currentQuantity} ədəd səbətinizdə var. Stokda yalnız ${remainingStock} ədəd qalıb.`,
            variant: "destructive",
          })
          return
        }
      }
      
      await addItem(book.id)
      // Notification removed - cart updates automatically
    } catch (error: any) {
      console.error("Səbətə əlavə edərkən xəta:", error)
      // No notification shown on error
    }
  }

  useEffect(() => {
    fetchFeaturedBooks()
  }, [])

  const fetchFeaturedBooks = async () => {
    try {
      setError(null)
      console.log("FeaturedBooks: API call started")
      console.log("FeaturedBooks: API URL:", `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/books/?is_featured=true`)
      
      const data = await api.getFeaturedBooks()
      console.log("FeaturedBooks: API response:", data)
      console.log("FeaturedBooks: Response type:", typeof data)
      console.log("FeaturedBooks: Response keys:", Object.keys(data || {}))

      // Check API response
      if (Array.isArray(data)) {
        console.log("FeaturedBooks: Response is array")
        setBooks(data)
      } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as any).results)) {
        console.log("FeaturedBooks: Response has results array")
        setBooks((data as any).results)
      } else {
        console.error("FeaturedBooks: Unexpected API response format:", data)
        setBooks([])
        setError("Məlumat formatı düzgün deyil")
      }
    } catch (error) {
      console.error("FeaturedBooks: Failed to fetch featured books:", error)
      console.error("FeaturedBooks: Error details:", error)
      setError("Kitablar yüklənə bilmədi")
      setBooks([])
    } finally {
      setIsLoading(false)
    }
  }

  // Add error state
  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchFeaturedBooks} className="mt-4">
              Yenidən Cəhd Et
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // Add books.length check in loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Seçilmiş Kitablar</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ən populyar və yüksək reytinqli kitablarımızı kəşf edin
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Check books array
  if (!Array.isArray(books) || books.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Seçilmiş Kitablar</h2>
            <p className="text-gray-500">Hələlik seçilmiş kitab yoxdur.</p>
          </div>
        </div>
      </section>
    )
  }

  // Render books - now safe
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Seçilmiş Kitablar</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ən populyar və yüksək reytinqli kitablarımızı kəşf edin
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-300">
              <Link href={`/book/${book.slug}`} className="block">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img
                      src={book.cover_image || "/placeholder.svg?height=300&width=200"}
                      alt={book.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {book.is_featured && <Badge variant="destructive">Seçilmiş</Badge>}
                      {book.is_bestseller && <Badge variant="secondary">Ən Çox Satılan</Badge>}
                      {book.is_new && <Badge className="bg-green-500">Yeni</Badge>}
                    </div>
                    {book.discount_percentage > 0 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive">-{book.discount_percentage}%</Badge>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{book.authors.map((author) => author.name).join(", ")}</p>
                  <p className="text-gray-500 text-xs mb-2">{book.category.name}</p>

                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(book.average_rating) ? "fill-current" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {book.average_rating.toFixed(1)} ({book.reviews_count})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">{book.price}₼</span>
                      {book.original_price && (
                        <span className="text-sm text-gray-500 line-through">{book.original_price}₼</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">Stok: {book.stock_quantity}</span>
                  </div>
                </CardContent>
              </Link>
              
              <div className="px-4 pb-4">
                <Button 
                  className={`w-full ${book.stock_quantity === 0 ? '' : 'bg-green-600 hover:bg-green-700'}`}
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddToCart(book)
                  }} 
                  disabled={book.stock_quantity === 0 || (() => {
                    const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                    const currentQuantity = currentCartItem?.quantity || 0
                    return currentQuantity >= book.stock_quantity
                  })()}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {book.stock_quantity === 0 ? "Stokda Yoxdur" : 
                   (() => {
                     const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                     const currentQuantity = currentCartItem?.quantity || 0
                     if (currentQuantity >= book.stock_quantity) {
                       return "Stokda Maksimum"
                     }
                     return "Səbətə At"
                   })()
                  }
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
