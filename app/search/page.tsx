"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import api, { Book, Category, BookListResponse } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Search } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addItem } = useCart()

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories()
        if (Array.isArray(data)) {
          setCategories(data)
        } else if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) {
          setCategories(data.results)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    setLoading(true)
    setError("")

    const fetchBooks = async () => {
      try {
        let searchParams: any = {}
        
        if (query.trim()) {
          // Axtarış query-si varsa
          const matchingCategory = categories.find(
            category => category.name.toLowerCase().includes(query.toLowerCase())
          )

          if (matchingCategory) {
            searchParams.category = matchingCategory.id.toString()
          } else {
            searchParams.search = query
          }
        }
        // Query yoxdursa bütün kitabları gətir

        const data = await api.getBooks(searchParams)
        if (data && data.results && Array.isArray(data.results)) {
          setBooks(data.results)
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

    fetchBooks()
  }, [query, categories])

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
      {query ? (
        <h1 className="text-2xl font-bold mb-6">
          Axtarış nəticələri: <span className="text-blue-600">{query}</span>
        </h1>
      ) : (
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bütün Kitablar</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mövcud bütün kitabları kəşf edin. Maraqlandığınız kitabı tapmaq üçün yuxarıdakı axtarış çubuğundan istifadə edin.
          </p>
        </div>
      )}
      
      {loading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kitablar yüklənir...</p>
        </div>
      )}
      
      {error && <div className="text-red-500 text-center">{error}</div>}
      
      {!loading && !error && books.length === 0 && query && (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nəticə tapılmadı</h2>
          <p className="text-gray-600">"{query}" üçün heç bir kitab tapılmadı.</p>
        </div>
      )}
      
      {!loading && !error && books.length === 0 && !query && (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Kitab tapılmadı</h2>
          <p className="text-gray-600">Hal-hazırda heç bir kitab mövcud deyil.</p>
        </div>
      )}
      
      {books.length > 0 && (
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
                  <p className="text-gray-600 text-sm mb-2">{book.authors?.map((author: any) => author.name).join(", ")}</p>
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
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
} 