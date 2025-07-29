"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import api, { type Book } from "@/lib/api"

export function FeaturedBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()

  const handleAddToCart = async (book: Book) => {
    if (!isAuthenticated) {
      alert("Səbətə əlavə etmək üçün giriş etməlisiniz!")
      return
    }

    try {
      await addItem(book.id)
      alert("Kitab səbətə əlavə edildi!")
    } catch (error: any) {
      alert(error.message || "Xəta baş verdi!")
    }
  }

  useEffect(() => {
    fetchFeaturedBooks()
  }, [])

  const fetchFeaturedBooks = async () => {
    try {
      setError(null)
      const data = await api.getFeaturedBooks()
      console.log("Featured books data:", data) // Debug üçün

      // API cavabını yoxla
      if (Array.isArray(data)) {
        setBooks(data)
      } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as any).results)) {
        setBooks((data as any).results)
      } else {
        console.error("Unexpected API response format:", data)
        setBooks([])
        setError("Məlumat formatı düzgün deyil")
      }
    } catch (error) {
      console.error("Failed to fetch featured books:", error)
      setError("Kitablar yüklənə bilmədi")
      setBooks([])
    } finally {
      setIsLoading(false)
    }
  }

  // Error state əlavə edin
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

  // Loading state-də də books.length yoxlaması əlavə edin
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

  // Books array-ini yoxlayın
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

  // Render books - artıq təhlükəsizdir
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
          {books.map((book) => (
            <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={book.cover_image || "/placeholder.svg?height=300&width=200"}
                    alt={book.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {book.is_featured && <Badge variant="destructive">Seçilmiş</Badge>}
                    {book.is_bestseller && <Badge variant="secondary">Bestseller</Badge>}
                    {book.is_new && <Badge className="bg-green-500">Yeni</Badge>}
                  </div>
                  {book.discount_percentage > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">-{book.discount_percentage}%</Badge>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {book.authors && Array.isArray(book.authors)
                    ? book.authors.map((author) => author.name).join(", ")
                    : "Müəllif məlumatı yoxdur"}
                </p>

                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(book.average_rating || 0) ? "fill-current" : ""}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {(book.average_rating || 0).toFixed(1)} ({book.reviews_count || 0})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-600">{book.price}₼</span>
                    {book.original_price && (
                      <span className="text-sm text-gray-500 line-through">{book.original_price}₼</span>
                    )}
                  </div>
                </div>

                <Button className="w-full" onClick={() => handleAddToCart(book)} disabled={book.stock_quantity === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {book.stock_quantity === 0 ? "Stokda Yoxdur" : "Səbətə At"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
