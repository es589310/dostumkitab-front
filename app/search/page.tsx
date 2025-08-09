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
        let allBooks: Book[] = []
        let searchResults = {
          exact: [],
          partial: [],
          related: []
        }
        
        if (query.trim()) {
          console.log("ElasticSearch: Starting SMART search for:", query)
          
          const searchTerm = query.toLowerCase().trim()
          const searchWords = searchTerm.split(' ').filter(word => word.length > 2) // Min 3 hərf
          
          // Tək söz axtarışı və çox qısa sözlər üçün xüsusi qaydalar
          const isSingleShortWord = searchWords.length === 1 && searchTerm.length <= 3
          const isSingleWord = searchWords.length === 1
          
          console.log("ElasticSearch: Search words:", searchWords)

          // SMART RELEVANCE FUNCTION
          const calculateRelevance = (book: any, searchTerm: string, searchWords: string[]) => {
            const title = book.title?.toLowerCase() || ''
            const description = book.description?.toLowerCase() || ''
            
            // Authors array-den bütün adları birləşdirək 
            const authorsNames = book.authors?.map((author: any) => author.name?.toLowerCase()).join(' ') || ''
            
            // Publisher object-den adı alaq
            const publisherName = book.publisher?.name?.toLowerCase() || ''
            
            // Category adı 
            const categoryName = book.category?.name?.toLowerCase() || ''
            
            let score = 0
            let reasons = []

            console.log(`ElasticSearch: Analyzing "${book.title}"`)
            console.log(`- Authors: "${authorsNames}"`)
            console.log(`- Publisher: "${publisherName}"`)
            console.log(`- Category: "${categoryName}"`)

            // TAM UYĞUNLUQ - ən yüksək bal
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

            // PARÇALİ UYĞUNLUQ - hər söz üçün
            searchWords.forEach(word => {
              if (title.includes(word)) {
                score += 30
                reasons.push(`title contains word "${word}"`)
              }
              if (authorsNames.includes(word)) {
                score += 25
                reasons.push(`author contains word "${word}"`)
              }
              if (publisherName.includes(word)) {
                score += 20
                reasons.push(`publisher contains word "${word}"`)
              }
              if (categoryName.includes(word)) {
                score += 18
                reasons.push(`category contains word "${word}"`)
              }
              if (description.includes(word)) {
                score += 15
                reasons.push(`description contains word "${word}"`)
              }
            })

            // ADVANCED FUZZY MATCH - Yalnız həqiqətən yaxın uyğunluqlar üçün
            const advancedFuzzyMatch = (text: string, term: string) => {
              if (text.length === 0 || term.length < 4) return { match: false, score: 0 }
              
              // 1. Dəqiq substring uyğunluğu - ən yaxşı
              if (text.includes(term)) {
                return { match: true, score: 50 }
              }
              
              // 2. Sözün başlanğıcı uyğun gəlirsə 
              const words = text.split(' ')
              for (const word of words) {
                if (word.startsWith(term) && word.length <= term.length + 3) {
                  return { match: true, score: 30 }
                }
              }
              
              // 3. Levenshtein distance - çox yaxın sözlər
              const levenshteinDistance = (a: string, b: string) => {
                const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))
                for (let i = 0; i <= a.length; i++) matrix[0][i] = i
                for (let j = 0; j <= b.length; j++) matrix[j][0] = j
                for (let j = 1; j <= b.length; j++) {
                  for (let i = 1; i <= a.length; i++) {
                    const indicator = a[i - 1] === b[j - 1] ? 0 : 1
                    matrix[j][i] = Math.min(
                      matrix[j][i - 1] + 1,
                      matrix[j - 1][i] + 1,
                      matrix[j - 1][i - 1] + indicator
                    )
                  }
                }
                return matrix[b.length][a.length]
              }
              
              // Sözlər arasında yaxın uyğunluq axtarımı
              for (const word of words) {
                if (word.length >= term.length - 1 && word.length <= term.length + 2) {
                  const distance = levenshteinDistance(word, term)
                  const similarity = 1 - (distance / Math.max(word.length, term.length))
                  if (similarity >= 0.7) { // 70% oxşarlıq tələb edir
                    return { match: true, score: Math.floor(similarity * 20) }
                  }
                }
              }
              
              return { match: false, score: 0 }
            }

            // Fuzzy matching YALNIZ uzun sözlər üçün və yalnız yaxın uyğunluqlar
            if (searchTerm.length >= 4) {
              const authorFuzzy = advancedFuzzyMatch(authorsNames, searchTerm)
              if (authorFuzzy.match) {
                score += authorFuzzy.score
                reasons.push(`advanced fuzzy author match for "${searchTerm}" (score: ${authorFuzzy.score})`)
              }
              
              const publisherFuzzy = advancedFuzzyMatch(publisherName, searchTerm)
              if (publisherFuzzy.match) {
                score += publisherFuzzy.score
                reasons.push(`advanced fuzzy publisher match for "${searchTerm}" (score: ${publisherFuzzy.score})`)
              }
            }

            console.log(`- Final score: ${score}`)
            console.log(`- Reasons: ${reasons.join(', ')}`)
            
            return { score, reasons }
          }

          // 1. BÜTün KİTABLARI GÖTÜR və RELEVANCE HESABLA
          try {
            const allBooksData = await api.getBooks()
            if (allBooksData?.results) {
              console.log("ElasticSearch: Analyzing", allBooksData.results.length, "books for relevance")
              
              const scoredBooks = allBooksData.results
                .map(book => {
                  const relevance = calculateRelevance(book, searchTerm, searchWords)
                  return { ...book, relevanceScore: relevance.score, relevanceReasons: relevance.reasons }
                })
                .filter(book => book.relevanceScore >= 15) // Min 15 bal (çox zəif uyğunluqları çıxarır)
                .sort((a, b) => b.relevanceScore - a.relevanceScore) // Ən yüksək skordan aşağıya

              console.log("ElasticSearch: Books with relevance scores:")
              scoredBooks.slice(0, 10).forEach(book => {
                console.log(`- ${book.title}: Score ${book.relevanceScore} (${book.relevanceReasons.join(', ')})`)
              })

              allBooks = scoredBooks
            }
          } catch (e) {
            console.log("ElasticSearch: Smart search failed, falling back to API:", e)
            
            // Fallback - köhnə metod
            try {
              const fallbackData = await api.getBooks({ search: query })
              if (fallbackData?.results) {
                allBooks = fallbackData.results
              }
            } catch (fallbackError) {
              console.log("ElasticSearch: Fallback also failed:", fallbackError)
            }
          }

          // 2. KATEQORİYA ƏLAVƏ BONUSU
          const matchingCategories = categories.filter(category => 
            category.name.toLowerCase().includes(searchTerm) ||
            searchWords.some(word => category.name.toLowerCase().includes(word))
          )
          
          if (matchingCategories.length > 0) {
            console.log("ElasticSearch: Found matching categories:", matchingCategories.map(c => c.name))
            
            for (const category of matchingCategories) {
              try {
                const categoryData = await api.getBooks({ category: category.id.toString() })
                if (categoryData?.results) {
                  const categoryBooks = categoryData.results
                    .filter(book => !allBooks.some(existing => existing.id === book.id))
                    .map(book => ({ 
                      ...book, 
                      relevanceScore: 40, // Kateqoriya bonus skoru
                      relevanceReasons: [`in category "${category.name}"`],
                      categoryMatch: true 
                    }))
                  
                  allBooks.push(...categoryBooks)
                  console.log(`ElasticSearch: Added ${categoryBooks.length} books from category "${category.name}"`)
                }
              } catch (e) {
                console.log(`ElasticSearch: Category ${category.name} search failed:`, e)
              }
            }
          }

          // 3. SON SIRALAMA və FİLTRLƏMƏ
          allBooks = allBooks
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 50) // Max 50 nəticə

          console.log("ElasticSearch: Final results:")
          console.log("- Total relevant books:", allBooks.length)
          console.log("- Highest score:", allBooks[0]?.relevanceScore || 0)
          console.log("- Lowest score:", allBooks[allBooks.length - 1]?.relevanceScore || 0)
          
          setBooks(allBooks)
        } else {
          // Query yoxdursa bütün kitabları gətir
          const data = await api.getBooks()
          if (data?.results) {
            setBooks(data.results)
          } else {
            setBooks([])
          }
        }
      } catch (error) {
        console.error("ElasticSearch: Global error:", error)
        setError("Axtarış xətası baş verdi")
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
                      src={book.cover_image || "/placeholder.svg?height=300&width=200"}
                      alt={book.title}
                      className="w-full h-64 object-cover rounded-lg"
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