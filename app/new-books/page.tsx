"use client"

import { useEffect, useState } from "react"
import { Metadata } from "next"
import api, { type Book } from "@/lib/api"

export const metadata: Metadata = {
  title: 'Yeni Kitablar | DostumKitab.az',
  description: 'Yeni çıxan kitabları kəşf edin. DostumKitab.az-da ən son nəşr olunan kitablar ən yaxşı qiymətlərlə!',
  keywords: 'yeni kitablar, yeni nəşr kitablar, yeni çıxan kitablar, kitab mağazası',
}
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

export default function NewBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addItem, cart } = useCart()

  useEffect(() => {
    setLoading(true)
    setError("")

    const fetchNewBooks = async () => {
      try {
        const res = await api.getNewBooks()
        if (Array.isArray(res)) {
          setBooks(res)
        } else if (res && typeof res === "object" && "results" in res && Array.isArray(res.results)) {
          setBooks(res.results)
        } else {
          setBooks([])
        }
      } catch (error) {
        setError("Xəta baş verdi")
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    fetchNewBooks()
  }, [])

  const handleAddToCart = async (book: Book) => {
    try {
      await addItem(book.id)
      // Notification deleted - cart updates automatically
    } catch (error: any) {
      console.error("Səbətə əlavə edərkən xəta:", error)
      // Notification is not shown in case of an error
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Yeni Kitablar</h2>
      {loading && <div>Yüklənir...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && books.length === 0 && (
        <div className="text-gray-500 text-lg">Yeni kitab tapılmadı</div>
      )}
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
                    {book.original_price && parseFloat(book.original_price) > parseFloat(book.price) && (
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
    </div>
  )
} 