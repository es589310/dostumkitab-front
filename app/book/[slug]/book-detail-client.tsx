"use client"

import { useEffect, useState } from "react"
import api, { type Book } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, ArrowLeft } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"
import { BookReviews } from "@/components/book-reviews"
import { getLanguageName } from "@/lib/utils"

interface BookDetailClientProps {
  slug: string
}

export default function BookDetailClient({ slug }: BookDetailClientProps) {
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addItem, cart } = useCart()

  useEffect(() => {
    if (!slug) return

    setLoading(true)
    setError("")

    const fetchBook = async () => {
      try {
        const bookData = await api.getBook(slug)
        setBook(bookData)
      } catch (error) {
        setError("Kitab tapılmadı")
        setBook(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [slug])

  const handleAddToCart = async () => {
    if (!book) return
    
    try {
      await addItem(book.id)
    } catch (error: any) {
      console.error("Səbətə əlavə edərkən xəta:", error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Yüklənir...</div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Kitab tapılmadı</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Ana səhifəyə qayıt
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book Image və Təsvir */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={book.cover_imagekit_url || book.cover_image || "/placeholder.svg?height=600&width=400"}
              alt={book.title}
              className="w-full h-[500px] object-contain bg-gray-100 rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg?height=600&width=400";
              }}
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {book.is_featured && <Badge variant="destructive">Seçilmiş</Badge>}
              {book.is_bestseller && <Badge variant="secondary">Ən Çox Satılan</Badge>}
              {book.is_new && <Badge className="bg-green-500">Yeni</Badge>}
            </div>
            {book.discount_percentage > 0 && (
              <div className="absolute top-4 right-4">
                <Badge variant="destructive">-{book.discount_percentage}%</Badge>
              </div>
            )}
          </div>
          {/* Təsvir */}
          {book.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Təsvir</h3>
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-lg text-gray-600 mb-4">
              {book.authors.map((author) => author.name).join(", ")}
            </p>
            <p className="text-sm text-gray-500 mb-4">{book.category.name}</p>
          </div>

          {/* Rating */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(book.average_rating) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {book.average_rating.toFixed(1)} ({book.reviews_count} rəy)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-green-600">{book.price}₼</span>
              {book.original_price && (
                <span className="text-lg text-gray-500 line-through">{book.original_price}₼</span>
              )}
            </div>
            <p className={`text-sm ${(() => {
              const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
              const currentQuantity = currentCartItem?.quantity || 0
              const availableStock = book.stock_quantity - currentQuantity
              return availableStock > 0 ? 'text-green-600' : 'text-red-600'
            })()}`}>
              {(() => {
                const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                const currentQuantity = currentCartItem?.quantity || 0
                const availableStock = book.stock_quantity - currentQuantity
                return availableStock > 0 ? 'Stokda var' : 'Stokda bitdi'
              })()}
            </p>
          </div>

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart} 
            disabled={(() => {
              const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
              const currentQuantity = currentCartItem?.quantity || 0
              const availableStock = book.stock_quantity - currentQuantity
              return availableStock <= 0
            })()}
            className={`w-full h-12 text-lg ${(() => {
              const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
              const currentQuantity = currentCartItem?.quantity || 0
              const availableStock = book.stock_quantity - currentQuantity
              return availableStock > 0 ? 'bg-green-600 hover:bg-green-700' : ''
            })()}`}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
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

          {/* Book Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kitab Haqqında</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nəşriyyat:</span>
                <span>{book.publisher?.name || "Məlumat yoxdur"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dil:</span>
                <span>{getLanguageName(book.language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Səhifə sayı:</span>
                <span>{book.pages}</span>
              </div>
              {book.publication_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Nəşr tarixi:</span>
                  <span>{new Date(book.publication_date).toLocaleDateString('az-AZ')}</span>
                </div>
              )}
              {book.isbn && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ISBN:</span>
                  <span>{book.isbn}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <BookReviews bookId={book.id} bookSlug={book.slug} />
    </div>
  )
} 