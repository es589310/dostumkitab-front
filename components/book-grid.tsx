"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import api, { type Book, type Category } from "@/lib/api"

export function BookGrid() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [selectedCategory, sortBy, searchTerm, currentPage])

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories()
      if (Array.isArray(data)) {
        setCategories(data)
      } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as any).results)) {
        setCategories((data as any).results)
      } else {
        console.error("Unexpected categories API response:", data)
        setCategories([])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      setCategories([]) // Error zamanı boş array təyin edin
    }
  }

  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page: currentPage,
        ordering: sortBy === "price-low" ? "price" : sortBy === "price-high" ? "-price" : `-${sortBy}`,
      }

      if (searchTerm) params.search = searchTerm
      if (selectedCategory) params.category = selectedCategory

      const response = await api.getBooks(params)
      console.log("Books API response:", response) // Debug

      if (response && Array.isArray(response.results)) {
        setBooks(response.results)
        setTotalPages(Math.ceil(response.count / 20))
      } else {
        console.error("Unexpected books API response:", response)
        setBooks([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Failed to fetch books:", error)
      setBooks([])
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSearch = (value: string) => {
    setSearchTerm(value)
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

  if (isLoading && books.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Bütün Kitablar</h2>
            <p className="text-lg text-gray-600">Geniş kitab kolleksiyamızı araşdırın</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Bütün Kitablar</h2>
          <p className="text-lg text-gray-600">Geniş kitab kolleksiyamızı araşdırın</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Kitab və ya müəllif axtarın..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-48">
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
            <SelectTrigger className="w-full md:w-48">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(books) &&
            books.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-300">
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

                  <Button className="w-full" onClick={() => handleAddToCart(book)} disabled={book.stock_quantity === 0}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {book.stock_quantity === 0 ? "Stokda Yoxdur" : "Səbətə At"}
                  </Button>
                </CardContent>
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
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Əvvəlki
            </Button>
            <span className="flex items-center px-4">
              Səhifə {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Növbəti
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
