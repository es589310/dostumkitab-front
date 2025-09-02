"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import api, { type Book, type Category } from "@/lib/api"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

interface BookGridProps {
  searchTerm?: string
  categoryId?: string
  bestseller?: boolean
  isNew?: boolean
  discount?: boolean
}

export function BookGrid({
  searchTerm = "",
  categoryId = "",
  bestseller = false,
  isNew = false,
  discount = false,
}: BookGridProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(categoryId)
  const [sortBy, setSortBy] = useState("created_at")
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { addItem, cart } = useCart()
  
  // Track cart updates
  useEffect(() => {
    console.log('BookGrid: Cart updated:', cart)
    if (cart) {
      console.log('BookGrid: Total items in cart:', cart.total_items)
    }
  }, [cart])

  // Sync initial props with internal state
  useEffect(() => {
    setInternalSearchTerm(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    setSelectedCategory(categoryId)
  }, [categoryId])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [selectedCategory, sortBy, internalSearchTerm, currentPage])

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories()
      if (Array.isArray(data)) {
        setCategories(data)
      } else if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) {
        setCategories(data.results)
      } else {
        console.error("Unexpected categories API response:", data)
        setCategories([])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      setCategories([])
    }
  }

  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page: currentPage,
        ordering: sortBy === "price-low" ? "price" : sortBy === "price-high" ? "-price" : `-${sortBy}`,
      }

      if (internalSearchTerm) params.search = internalSearchTerm
      if (selectedCategory) params.category = selectedCategory

      const response = await api.getBooks(params)
      console.log("Books API response:", response)

      if (response && Array.isArray(response.results)) {
        setBooks(response.results)
        setTotalPages(Math.ceil(response.count / 20))
      } else {
        console.error("Unexpected books API response format:", response)
        setBooks([])
      }
    } catch (error) {
      console.error("Failed to fetch books:", error)
      setBooks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleAddToCart = async (book: Book) => {
    try {
      const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
      const currentQuantity = currentCartItem?.quantity || 0
      const availableStock = book.stock_quantity
      
      if (currentQuantity >= availableStock) {
        const remainingStock = availableStock - currentQuantity
        if (remainingStock <= 0) {
          toast({
            title: "Stokda yoxdur!",
            description: `Bu kitabdan artıq ${currentQuantity} ədəd səbətinizdə var və stokda yalnız ${availableStock} ədəd var.`,
            variant: "destructive",
          })
          return
        } else {
          toast({
            title: "Stok məhdudiyyəti!",
            description: `Bu kitabdan artıq ${currentQuantity} ədəd səbətinizdə var. Stokda yalnız ${remainingStock} ədəd qalıb.`,
            variant: "destructive",
          })
          return
        }
      }
      
      await addItem(book.id)
    } catch (error: any) {
      console.error("Səbətə əlavə edərkən xəta:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Kitablar yüklənir...</p>
      </div>
    )
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <Input
              placeholder="Kitab, müəllif və ya kateqoriya axtarın..."
              value={internalSearchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
          <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Kateqoriya" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hamısı</SelectItem>
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Yeni Əlavələr</SelectItem>
              <SelectItem value="sales_count">Populyarlıq</SelectItem>
              <SelectItem value="views_count">Ən Çox Baxılan</SelectItem>
              <SelectItem value="price-low">Qiymət (Aşağı)</SelectItem>
              <SelectItem value="price-high">Qiymət (Yüksək)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-4 justify-items-center">
          {Array.isArray(books) &&
            books.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-300 w-full max-w-[157px] h-auto sm:w-[190px] sm:h-auto">
                <Link href={`/book/${book.slug}`} className="block">
                  <CardContent className="p-2">
                    <div className="relative mb-2">
                      <img
                        src={book.cover_imagekit_url || book.cover_image || "/placeholder.svg?height=300&width=200"}
                        alt={book.title}
                        className="w-full h-48 object-contain bg-gray-100 rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg?height=300&width=200";
                        }}
                      />
                      <div className="absolute top-1 left-1 flex flex-col gap-1">
                        {book.is_bestseller && <Badge variant="secondary" className="text-xs px-1.5 py-0.5">Ən Çox Satılan</Badge>}
                        {book.is_new && <Badge className="bg-green-500 text-xs px-1.5 py-0.5">Yeni</Badge>}
                      </div>
                    </div>

                    <h3 className="text-xs font-semibold mb-1 line-clamp-2 text-center leading-tight">{book.title}</h3>
                    <p className="text-xs text-gray-600 mb-2 text-center leading-tight">{book.authors.map((author) => author.name).join(", ")}</p>

                    <div className="flex items-center justify-center mb-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-bold text-green-600">{book.price}₼</span>
                        {book.original_price && (
                          <span className="text-xs text-gray-500 line-through">{book.original_price}₼</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
                
                <div className="px-2 pb-2">
                  <Button 
                    className={`w-full h-8 text-xs ${book.stock_quantity === 0 ? '' : 'bg-green-600 hover:bg-green-700'}`}
                    onClick={() => handleAddToCart(book)}
                    disabled={book.stock_quantity === 0 || (() => {
                      const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                      const currentQuantity = currentCartItem?.quantity || 0
                      return currentQuantity >= book.stock_quantity
                    })()}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {book.stock_quantity === 0 ? "Stokda Yoxdur" : 
                     (() => {
                       const currentCartItem = cart?.items?.find(item => item.book.id === book.id)
                       const currentQuantity = currentCartItem?.quantity || 0
                       if (currentQuantity >= book.stock_quantity) {
                         return "Stokda Maksimum"
                       }
                       return "Səbətə At"
                     })()
                    }
                  </Button>
                </div>
              </Card>
            ))}
        </div>

        {books.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Heç bir kitab tapılmadı.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2"
            >
              Əvvəlki
            </Button>
            <span className="flex items-center px-4 py-2">
              Səhifə {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2"
            >
              Növbəti
            </Button>
          </div>
        )}
      </div>
    </section>
  )
} 