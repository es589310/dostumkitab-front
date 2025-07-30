"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api, { type Book, type BookReview } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, ShoppingCart, ArrowLeft } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function BookDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<BookReview[]>([])
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addItem } = useCart()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!slug) return

    setLoading(true)
    setError("")

    const fetchBook = async () => {
      try {
        console.log("Fetching book with slug:", slug)
        
        // Önce tüm kitapları al ve slug'a göre kitabı bul
        const allBooks = await api.getBooks()
        console.log("All books received:", allBooks)
        
        let bookData: Book | null = null
        if ('results' in allBooks) {
          // BooksResponse formatında
          bookData = allBooks.results.find(book => book.slug === slug) || null
        } else {
          // Book[] formatında
          bookData = allBooks.find(book => book.slug === slug) || null
        }
        
        if (!bookData) {
          throw new Error("Kitab tapılmadı")
        }
        
        console.log("Book data found:", bookData)
        setBook(bookData)
        
        // Kitap değerlendirmelerini al
        console.log("Fetching reviews for book ID:", bookData.id)
        const reviewsData = await api.getBookReviews(bookData.id)
        console.log("Reviews data received:", reviewsData)
        setReviews(reviewsData)
      } catch (error) {
        console.error("Error fetching book:", error)
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

  const handleSubmitReview = async () => {
    if (!book || !isAuthenticated) return
    
    if (userRating === 0) {
      alert("Zəhmət olmasa bir yıldız seçin!")
      return
    }

    try {
      setIsSubmittingReview(true)
      await api.createReview(book.id, userRating, userComment)
      
      // Değerlendirmeleri yenile
      const reviewsData = await api.getBookReviews(book.id)
      setReviews(reviewsData)
      
      // Formu temizle
      setUserRating(0)
      setUserComment("")
      
      alert("Değerlendirməniz uğurla göndərildi!")
    } catch (error: any) {
      alert(error.message || "Değerlendirmə göndərilə bilmədi!")
    } finally {
      setIsSubmittingReview(false)
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
        {/* Book Image */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={book.cover_image || "/placeholder.svg?height=600&width=400"}
              alt={book.title}
              className="w-full h-[500px] object-contain rounded-lg shadow-lg bg-gray-50"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {book.is_featured && <Badge variant="destructive">Seçilmiş</Badge>}
              {book.is_bestseller && <Badge variant="secondary">Bestseller</Badge>}
              {book.is_new && <Badge className="bg-green-500">Yeni</Badge>}
            </div>
            {book.discount_percentage > 0 && (
              <div className="absolute top-4 right-4">
                <Badge variant="destructive">-{book.discount_percentage}%</Badge>
              </div>
            )}
          </div>
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

            {/* User Rating (if authenticated) */}
            {isAuthenticated && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Sizin değerlendirməniz:</p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setUserRating(i + 1)}
                      className="text-yellow-400 hover:text-yellow-500 transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${i < userRating ? "fill-current" : ""}`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {userRating > 0 ? `${userRating} yıldız` : "Yıldız seçin"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-green-600">{book.price}₼</span>
              {book.original_price && (
                <span className="text-lg text-gray-500 line-through">{book.original_price}₼</span>
              )}
            </div>
            <p className="text-sm text-gray-500">Stok: {book.stock_quantity} ədəd</p>
          </div>

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart} 
            disabled={book.stock_quantity === 0}
            className="w-full h-12 text-lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {book.stock_quantity === 0 ? "Stokda Yoxdur" : "Səbətə At"}
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
                <span>{book.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Səhifə sayı:</span>
                <span>{book.pages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nəşr tarixi:</span>
                <span>{new Date(book.publication_date).toLocaleDateString('az-AZ')}</span>
              </div>
              {book.isbn && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ISBN:</span>
                  <span>{book.isbn}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Təsvir</h3>
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Review Form (if authenticated) */}
          {isAuthenticated && userRating > 0 && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Değerlendirmə yazın</h3>
              <div className="space-y-3">
                <Textarea
                  placeholder="Kitab haqqında fikirlərinizi yazın..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="w-full"
                >
                  {isSubmittingReview ? "Göndərilir..." : "Değerlendirməni Göndər"}
                </Button>
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">İstifadəçi değerlendirmələri</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.user_name}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "fill-current" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.created_at).toLocaleDateString('az-AZ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 