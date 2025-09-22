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
  const { addItem, cart } = useCart()
  
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
          const searchWords = searchTerm.split(' ').filter(word => word.length > 1)
          
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

            // SPECIAL CASE: Short words (like "Zehin") get extra points if they start words
            if (searchTerm.length <= 5) {
              const titleWords = title.split(' ')
              const descriptionWords = description.split(' ')
              
              titleWords.forEach(word => {
                if (word.startsWith(searchTerm)) {
                  score += 40 // Extra points for word start match
                }
              })
              
              descriptionWords.forEach(word => {
                if (word.startsWith(searchTerm)) {
                  score += 25 // Extra points for word start match
                }
              })
            }

            return { score, reasons }
          }

          try {
            // Əvvəlcə backend API-dən axtarış et
            const searchData = await api.getBooks({ search: query })
            if (searchData?.results && searchData.results.length > 0) {
              allBooks = searchData.results
            } else {
              // Əgər backend API-dən nəticə gəlmirsə, Smart Search istifadə et
              const allBooksData = await api.getBooks()
              if (allBooksData?.results) {
                const scoredBooks = allBooksData.results
                  .map(book => {
                    const relevance = calculateRelevance(book, searchTerm, searchWords)
                    return { ...book, relevanceScore: relevance.score, relevanceReasons: relevance.reasons }
                  })
                  .filter(book => book.relevanceScore >= 10)
                  .sort((a, b) => b.relevanceScore - a.relevanceScore)

                allBooks = scoredBooks
              }
            }
          } catch (e) {
            console.log("Search failed:", e)
            // Son çarə olaraq Smart Search istifadə et
            try {
              const allBooksData = await api.getBooks()
              if (allBooksData?.results) {
                const scoredBooks = allBooksData.results
                  .map(book => {
                    const relevance = calculateRelevance(book, searchTerm, searchWords)
                    return { ...book, relevanceScore: relevance.score, relevanceReasons: relevance.reasons }
                  })
                  .filter(book => book.relevanceScore >= 10)
                  .sort((a, b) => b.relevanceScore - a.relevanceScore)

                allBooks = scoredBooks
              }
            } catch (fallbackError) {
              console.log("Smart search also failed:", fallbackError)
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {books.map((book) => (
            <div key={book.id} className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
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
              <div className="px-3 pb-3">
                {/* Title */}
                <div className="text-center mb-6 h-16 flex items-center justify-center">
                  <Link href={`/book/${book.slug}`} className="block w-full">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                  </Link>
                </div>

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