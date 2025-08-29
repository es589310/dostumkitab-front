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
      
      // Debug: Environment variables yoxlayırıq
      console.log("FeaturedBooks: NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL)
      console.log("FeaturedBooks: NODE_ENV:", process.env.NODE_ENV)
      
      // API URL-i düzgün alırıq
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
      console.log("FeaturedBooks: Final API URL:", apiUrl)
      
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
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Seçilmiş Kitablar
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            Ən populyar və yüksək reytinqli kitablarımızı kəşf edin
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {books.map((book) => (
            <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-300 w-[190px] h-auto">
              <Link href={`/book/${book.slug}`} className="block">
                <CardContent className="p-2">
                  <div className="relative mb-2">
                    <img
                      src={book.cover_imagekit_url || book.cover_image || "/placeholder.svg?height=300&width=200"}
                      alt={book.title}
                      className="w-full h-48 object-contain bg-gray-100 rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=300&width=200";
                      }}
                    />
                    <div className="absolute top-1 left-1 flex flex-col gap-1">
                      {book.is_featured && <Badge variant="destructive" className="text-xs px-1.5 py-0.5">Seçilmiş</Badge>}
                      {book.is_bestseller && <Badge variant="secondary" className="text-xs px-1.5 py-0.5">Ən Çox Satılan</Badge>}
                      {book.is_new && <Badge className="bg-green-500 text-xs px-1.5 py-0.5">Yeni</Badge>}
                    </div>
                    {book.discount_percentage > 0 && (
                      <div className="absolute top-1 right-1">
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">-{book.discount_percentage}%</Badge>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xs font-semibold mb-1 line-clamp-2 text-center leading-tight">{book.title}</h3>
                  <p className="text-xs text-gray-600 mb-2 text-center leading-tight">{book.authors.map((author) => author.name).join(", ")}</p>

                  <div className="flex items-center justify-center mb-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-green-600">{book.price}₼</span>
                      {book.original_price && (
                        <span className="text-xs text-gray-500 line-through">{book.original_price}₼</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Link>
              
              <div className="px-2 pb-2">
                <Button 
                  className={`w-full h-8 text-xs ${book.stock_quantity === 0 ? '' : 'bg-green-600 hover:bg-green-700'}`}
                  onClick={() => handleAddToCart(book)}
                  disabled={book.stock_quantity === 0 || (() => {
                    const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                    const currentQuantity = currentCartItem?.quantity || 0
                    return currentQuantity >= book.stock_quantity
                  })()}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
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