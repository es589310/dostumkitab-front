"use client"

import { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { Book } from "@/lib/api"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

interface NewProductsCarouselProps {
  books: Book[]
}

export function NewProductsCarousel({ books }: NewProductsCarouselProps) {
  const [isClient, setIsClient] = useState(false)
  const { addItem, cart } = useCart()
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Track cart updates
  useEffect(() => {
    console.log('NewProductsCarousel: Cart updated:', cart)
    if (cart) {
      console.log('NewProductsCarousel: Total items in cart:', cart.total_items)
    }
  }, [cart])

  const handleAddToCart = async (book: Book) => {
    try {
      const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
      const currentQuantity = currentCartItem?.quantity || 0
      const availableStock = book.stock_quantity - currentQuantity
      
      if (availableStock <= 0) {
        toast({
          title: "Stokda Yoxdur!",
          description: "Bu kitabdan stokda qalmayıb.",
          variant: "destructive",
        })
        return
      }
      
      await addItem(book.id)
    } catch (error: any) {
      console.error("Səbətə əlavə edərkən xəta:", error)
    }
  }

  if (!isClient || !books.length) {
    return null
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="w-full mb-4">
          <div className="w-full flex items-center justify-center text-center mb-4">
            {/* <button 
              id="swiper-prev-new" 
              className="swiper-button-prev hidden sm:flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200 border border-gray-200 hover:border-gray-300" 
              tabIndex={0} 
              role="button" 
              aria-label="Previous slide"
            >
              <span className="text-2xl font-bold">&lt;</span>
            </button> */}
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mx-6">
              Yeni Məhsullar
            </div>
            {/* <button 
              id="swiper-next-new" 
              className="swiper-button-next hidden sm:flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200 border border-gray-200 hover:border-gray-300" 
              tabIndex={0} 
              role="button" 
              aria-label="Next slide"
            >
              <span className="text-2xl font-bold">&gt;</span>
            </button> */}
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              nextEl: '#swiper-next-new',
              prevEl: '#swiper-prev-new',
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 8,
                slidesPerGroup: 1,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
                slidesPerGroup: 1,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
                slidesPerGroup: 1,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 32,
                slidesPerGroup: 1,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 32,
                slidesPerGroup: 1,
              },
            }}
            loop={true}
            className="mySwiper"
          >
            {books.map((book) => (
              <SwiperSlide key={book.id} style={{ width: '140px' }} className="sm:!w-auto">
                <div className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full w-full">
              {/* Image Container */}
              <div className="relative p-2 sm:p-3 pb-2">
                <Link href={`/book/${book.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={book.cover_imagekit_url || book.cover_image || "/placeholder.svg?height=300&width=200"}
                      alt={book.title}
                      className="w-full h-32 sm:h-48 md:h-52 lg:h-56 object-contain transition-transform duration-300 group-hover:scale-105"
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
              <div className="px-2 sm:px-3 pb-2 sm:pb-3 flex-1 flex flex-col">
                {/* Title */}
                <div className="text-center mb-4 sm:mb-6 h-12 sm:h-16 flex items-center justify-center">
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
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link 
            href="/new-books"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Bütün Yeni Kitabları Gör
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}