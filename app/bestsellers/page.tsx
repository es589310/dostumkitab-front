"use client"

import { useEffect, useState } from "react"
import api, { type Book } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

export default function BestsellersPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addItem, cart } = useCart()

  useEffect(() => {
    setLoading(true)
    setError("")

    const fetchBestsellers = async () => {
      try {
        const res = await api.getBestsellerBooks()
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

    fetchBestsellers()
  }, [])

  const handleAddToCart = async (book: Book) => {
    try {
      await addItem(book.id)
      // Bildiriş silindi - cart avtomatik yenilənir
    } catch (error: any) {
      console.error("Səbətə əlavə edərkən xəta:", error)
      // Xəta halında da bildiriş göstərilmir
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Ən Çox Satılan Kitablar</h1>
      {loading && <div>Yüklənir...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && books.length === 0 && (
        <div className="text-gray-500 text-lg">Ən çox satılan kitab tapılmadı</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {books.map((book) => (
          <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-300">
            <Link href={`/book/${book.slug}`} className="block">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={book.cover_imagekit_url || book.cover_image || "/placeholder.svg?height=300&width=200"}
                    alt={book.title}
                    className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg?height=300&width=200";
                    }}
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {book.is_new && <Badge className="bg-green-500">Yeni</Badge>}
                  </div>
                  {book.discount_percentage > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">-{book.discount_percentage}%</Badge>
                    </div>
                  )}
                </div>

                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 line-clamp-2 text-center">{book.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 text-center">{book.authors.map((author) => author.name).join(", ")}</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 text-center">{book.category.name}</p>

                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm sm:text-base md:text-lg font-bold text-green-600">{book.price}₼</span>
                    {book.original_price && (
                      <span className="text-xs sm:text-sm text-gray-500 line-through">{book.original_price}₼</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Link>
            
            <div className="px-4 pb-4">
              <Button 
                className={`w-full ${(() => {
                  const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                  const currentQuantity = currentCartItem?.quantity || 0
                  const availableStock = book.stock_quantity - currentQuantity
                  return availableStock > 0 ? 'bg-green-600 hover:bg-green-700' : ''
                })()}`}
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
          </Card>
        ))}
      </div>
    </div>
  )
} 