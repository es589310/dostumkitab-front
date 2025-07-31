"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api, { type Book, type Category } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.id as string
  const [books, setBooks] = useState<Book[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!categoryId) return

    setLoading(true)
    setError("")

    const fetchCategoryBooks = async () => {
      try {
        // Kategori bilgilerini al
        const categoriesData = await api.getCategories()
        let categories: Category[] = []
        
        if (Array.isArray(categoriesData)) {
          categories = categoriesData
        } else if (categoriesData && typeof categoriesData === "object" && "results" in categoriesData && Array.isArray(categoriesData.results)) {
          categories = categoriesData.results
        }

        const currentCategory = categories.find(cat => cat.id.toString() === categoryId)
        setCategory(currentCategory || null)

        // Kategorideki kitapları al
        const res = await api.getBooks({ category: categoryId })
        if (res && Array.isArray(res.results)) {
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

    fetchCategoryBooks()
  }, [categoryId])

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-6">
        {category ? `${category.name} Kitabları` : "Kateqoriya"}
      </h1>
      {loading && <div>Yüklənir...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && books.length === 0 && (
        <div className="text-gray-500 text-lg">Bu kateqoriyada kitab tapılmadı</div>
      )}
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
                className="w-full" 
                onClick={(e) => {
                  e.preventDefault()
                  handleAddToCart(book)
                }} 
                disabled={book.stock_quantity === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {book.stock_quantity === 0 ? "Stokda Yoxdur" : "Səbətə At"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 