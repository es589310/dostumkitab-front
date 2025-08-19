"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import api, { Book, Category, BookListResponse, CategoriesResponse } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Search } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

function SearchContent() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const { addItem } = useCart()
  
  // Use Next.js useSearchParams hook for real-time query updates
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get("query") || ""

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories()
        if (Array.isArray(data)) {
          setCategories(data)
        } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as CategoriesResponse).results)) {
          setCategories((data as CategoriesResponse).results)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Update query when URL changes
  useEffect(() => {
    setQuery(currentQuery)
  }, [currentQuery])

  // Fetch books when query changes
  useEffect(() => {
    if (!query) {
      // If no query, fetch all books
      const fetchAllBooks = async () => {
        try {
          const data = await api.getBooks()
          if (data?.results) {
            setBooks(data.results)
          }
        } catch (error) {
          console.error("Failed to fetch all books:", error)
          setBooks([])
        }
      }
      fetchAllBooks()
      return
    }

    setLoading(true)
    setError("")

    const fetchBooks = async () => {
      try {
        let allBooks: Book[] = []
        
        if (query.trim()) {
          console.log("ElasticSearch: Starting SMART search for:", query)
          
          const searchTerm = query.toLowerCase().trim()
          const searchWords = searchTerm.split(' ').filter(word => word.length > 2)
          
          // SMART RELEVANCE FUNCTION
          const calculateRelevance = (book: any, searchTerm: string, searchWords: string[]) => {
            const title = book.title?.toLowerCase() || ''
            const description = book.description?.toLowerCase() || ''
            const authorsNames = book.authors?.map((author: any) => author.name?.toLowerCase()).join(' ') || ''
            const publisherName = book.publisher?.name?.toLowerCase() || ''
            const categoryName = book.category?.name?.toLowerCase() || ''
            
            let score = 0
            let reasons = []

            // EXACT MATCH - highest score
            if (title.includes(searchTerm)) {
              score += 100
              reasons.push(`title contains "${searchTerm}"`)
            }
            if (authorsNames.includes(searchTerm)) {
              score += 90
              reasons.push(`author contains "${searchTerm}"`)
            }
            if (publisherName.includes(searchTerm)) {
              score += 80
              reasons.push(`publisher contains "${searchTerm}"`)
            }
            if (categoryName.includes(searchTerm)) {
              score += 75
              reasons.push(`category contains "${searchTerm}"`)
            }
            if (description.includes(searchTerm)) {
              score += 70
              reasons.push(`description contains "${searchTerm}"`)
            }

            // PARTIAL MATCH - for each word
            searchWords.forEach(word => {
              if (title.includes(word)) score += 30
              if (authorsNames.includes(word)) score += 25
              if (publisherName.includes(word)) score += 20
              if (categoryName.includes(word)) score += 18
              if (description.includes(word)) score += 15
            })

            return { score, reasons }
          }

          try {
            const allBooksData = await api.getBooks()
            if (allBooksData?.results) {
              const scoredBooks = allBooksData.results
                .map(book => {
                  const relevance = calculateRelevance(book, searchTerm, searchWords)
                  return { ...book, relevanceScore: relevance.score, relevanceReasons: relevance.reasons }
                })
                .filter(book => book.relevanceScore >= 15)
                .sort((a, b) => b.relevanceScore - a.relevanceScore)

              allBooks = scoredBooks
            }
          } catch (e) {
            console.log("ElasticSearch: Smart search failed, falling back to API:", e)
            try {
              const fallbackData = await api.getBooks({ search: query })
              if (fallbackData?.results) {
                allBooks = fallbackData.results
              }
            } catch (fallbackError) {
              console.log("ElasticSearch: Fallback also failed:", fallbackError)
            }
          }

          allBooks = allBooks.slice(0, 50) // Max 50 results
        }
        
        setBooks(allBooks)
      } catch (error) {
        console.error("ElasticSearch: Global error:", error)
        setError("Axtarış xətası baş verdi")
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [query])

  const handleAddToCart = async (book: Book) => {
    try {
      await addItem(book.id)
    } catch (error: any) {
      console.error("Səbətə əlavə edərkən xəta:", error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {query ? (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Axtarış nəticələri: <span className="text-blue-600">"{query}"</span>
          </h1>
          <p className="text-gray-600">
            Kitab adları, yazarlar, nəşriyyatlar və kateqoriyalar arasında axtarılır...
          </p>
          {!loading && books.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ {books.length} nəticə tapıldı
            </p>
          )}
        </div>
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
                      src={book.cover_imagekit_url || book.cover_image || "/placeholder.svg?height=300&width=200"}
                      alt={book.title}
                      className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=300&width=200";
                      }}
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {book.is_featured && <Badge variant="destructive">Seçilmiş</Badge>}
                      {book.is_bestseller && <Badge variant="secondary">Ən Çox Satılan</Badge>}
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
                  className={`w-full ${book.stock_quantity === 0 ? '' : 'bg-green-600 hover:bg-green-700'}`}
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
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
} 