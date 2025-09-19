"use client"

import { useEffect, useState } from "react"
import api, { type Book } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, ArrowLeft, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"
import { BookReviews } from "@/components/book-reviews"
import { Breadcrumb, BreadcrumbSchema } from "@/components/breadcrumb"
import { getLanguageName, getMediaUrl } from "@/lib/utils"

interface BookDetailClientProps {
  slug: string
}

export default function BookDetailClient({ slug }: BookDetailClientProps) {
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addItem, cart, orderSingleBook } = useCart()

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

  const handleOrderSingleBook = async () => {
    if (!book) return
    
    // Stok yoxlaması - səbətdəki miqdarı da nəzərə al
    const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
    const currentQuantity = currentCartItem?.quantity || 0
    const availableStock = book.stock_quantity - currentQuantity
    
    if (availableStock <= 0) {
      return // Stokda yoxdursa heç nə etmə
    }
    
    try {
      await orderSingleBook(book)
    } catch (error: any) {
      console.error("Sifariş edərkən xəta:", error)
    }
  }

  // Carousel funksionallığı
  const getAvailableImages = () => {
    if (!book) return []
    
    const images = []
    
    // Üz qabığı
    if (book.cover_imagekit_url || book.cover_image) {
      images.push({
        src: book.cover_imagekit_url || book.cover_image,
        alt: `${book.title} - Üz qabığı`,
        type: 'cover'
      })
    }
    
    // Arxa qabıq
    if (book.back_imagekit_url || book.back_image) {
      images.push({
        src: book.back_imagekit_url || book.back_image,
        alt: `${book.title} - Arxa qabıq`,
        type: 'back'
      })
    }
    
    return images
  }

  const nextImage = () => {
    const images = getAvailableImages()
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    const images = getAvailableImages()
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
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
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Kitablar', href: '/categories' },
          { label: book.title }
        ]}
        className="mb-6"
      />
      
      {/* Structured Data */}
      <BreadcrumbSchema 
        items={[
          { label: 'Kitablar', href: '/categories' },
          { label: book.title }
        ]}
      />
      
      {/* Book Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            "name": book.title,
            "author": book.authors?.map((author: any) => ({
              "@type": "Person",
              "name": author.name
            })) || [],
            "image": book.cover_imagekit_url || book.cover_image || "/placeholder.svg",
            "description": book.description || `${book.title} kitabı`,
            "publisher": book.publisher?.name || "Məlumat yoxdur",
            "datePublished": book.publication_date,
            "isbn": book.isbn,
            "numberOfPages": book.pages,
            "inLanguage": getLanguageName(book.language),
            "offers": {
              "@type": "Offer",
              "url": `https://dostumkitab.az/book/${book.slug}`,
              "price": book.price,
              "priceCurrency": "AZN",
              "availability": book.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          })
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book Images və Təsvir */}
        <div className="space-y-4">
          {/* Carousel */}
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            {(() => {
              const images = getAvailableImages()
              
              if (images.length === 0) {
                return (
                  <div className="w-full h-[356px] lg:h-[500px] bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500">Şəkil yoxdur</span>
                  </div>
                )
              }
              
              return (
                <>
                  {/* Şəkil konteyneri */}
                  <div className="relative w-full h-[356px] lg:h-[500px] bg-gray-100 overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ 
                        transform: `translateX(-${currentImageIndex * 100}%)`
                      }}
                    >
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="w-full h-full flex-shrink-0 flex items-center justify-center"
                        >
                          <img
                            src={image.src || "/placeholder.svg?height=600&width=400"}
                            alt={image.alt}
                            className="w-full h-[356px] lg:h-[500px] object-contain bg-gray-100"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg?height=600&width=400";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Badge-lər */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {book.is_featured && <Badge variant="destructive">Seçilmiş</Badge>}
                    {book.is_bestseller && <Badge variant="secondary">Ən Çox Satılan</Badge>}
                    {book.is_new && <Badge className="bg-green-500">Yeni</Badge>}
                  </div>
                  
                  {/* Navigation oxları - yalnız birdən çox şəkil varsa */}
                  {images.length > 1 && (
                    <>
                      {/* Sol ox */}
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                        aria-label="Əvvəlki şəkil"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      
                      {/* Sağ ox */}
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                        aria-label="Növbəti şəkil"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}
                  
                  
                  {/* Dots göstəricisi */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'bg-white' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                          aria-label={`Şəkil ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>

        {/* Book Details */}
        <div className="space-y-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4">
              {book.authors.map((author) => author.name).join(", ")}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">{book.category.name}</p>
          </div>

          {/* Rating */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${i < Math.floor(book.average_rating) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-600">
                {book.average_rating.toFixed(1)} ({book.reviews_count} rəy)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{book.price}₼</span>
              {book.original_price && (
                <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through">{book.original_price}₼</span>
              )}
            </div>
            <p className={`text-xs sm:text-sm ${(() => {
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
          {book.stock_quantity > 0 ? (
            <Button 
              onClick={handleAddToCart} 
              disabled={(() => {
                const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                const currentQuantity = currentCartItem?.quantity || 0
                const availableStock = book.stock_quantity - currentQuantity
                return availableStock <= 0
              })()}
              className={`w-full h-9 sm:h-10 md:h-12 text-sm sm:text-base md:text-lg ${(() => {
                const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                const currentQuantity = currentCartItem?.quantity || 0
                const availableStock = book.stock_quantity - currentQuantity
                return availableStock > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
              })()}`}
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2" />
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
          ) : (
            <div className="w-full h-9 sm:h-10 md:h-12 bg-gray-400 text-white rounded-md flex items-center justify-center text-sm sm:text-base md:text-lg cursor-not-allowed">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2" />
              Stokda Yoxdur
            </div>
          )}

          {/* Order Single Book Button */}
          {(() => {
            const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
            const currentQuantity = currentCartItem?.quantity || 0
            const availableStock = book.stock_quantity - currentQuantity
            
            return (
              <Button 
                onClick={handleOrderSingleBook}
                disabled={availableStock <= 0}
                className={`w-full h-9 sm:h-10 md:h-12 text-sm sm:text-base md:text-lg ${
                  availableStock > 0 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-200 text-blue-400 cursor-not-allowed'
                }`}
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2" />
                Sifariş Et
              </Button>
            )
          })()}

          {/* Book Details */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold">Məhsul Haqqında</h3>
            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Nəşriyyat:</span>
                <span className="font-medium">{book.publisher?.name || "Məlumat yoxdur"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Dil:</span>
                <span className="font-medium">{getLanguageName(book.language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Səhifə sayı:</span>
                <span className="font-medium">{book.pages}</span>
              </div>
              {book.publication_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Nəşr tarixi:</span>
                  <span className="font-medium">{new Date(book.publication_date).toLocaleDateString('az-AZ')}</span>
                </div>
              )}
              {book.isbn && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">ISBN:</span>
                  <span className="font-medium">{book.isbn}</span>
                </div>
              )}
            </div>
          </div>

          {/* Təsvir - Responsive üçün "Kitab Haqqında" bölməsindən aşağıda */}
          {book.description && (
            <div className="space-y-3 lg:hidden">
              <h3 className="text-lg sm:text-xl font-semibold">Təsvir</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{book.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop üçün Təsvir - sağ tərəfdə */}
      {book.description && (
        <div className="hidden lg:block mt-8">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Təsvir</h3>
            <p className="text-base text-gray-600 leading-relaxed">{book.description}</p>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <BookReviews bookId={book.id} bookSlug={book.slug} />

      {/* Oxşar Kitablar Bölməsi */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Oxşar Kitablar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Burada oxşar kitablar göstəriləcək - API-dən gələn məlumatlar əsasında */}
          <div className="text-center text-gray-500 py-8">
            <p>Oxşar kitablar tezliklə əlavə ediləcək</p>
          </div>
        </div>
      </div>
    </div>
  )
} 