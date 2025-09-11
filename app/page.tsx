"use client"

import { useState, useEffect } from 'react'
import { HeroSection } from "@/components/hero-section"
import { BookGrid } from "@/components/book-grid"
import { NewProductsCarousel } from "@/components/new-products-carousel"
import api, { Book } from "@/lib/api"

export default function HomePage() {
  const [newBooks, setNewBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewBooks = async () => {
      try {
        const response = await api.getNewBooks()
        setNewBooks(response.results || [])
      } catch (error) {
        console.error('Error fetching new books:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNewBooks()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* New Products Section */}
      {!loading && newBooks.length > 0 && (
        <NewProductsCarousel books={newBooks} />
      )}
      
      {/* All Books Section */}
      <section id="all-books-section" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Geniş kitab kolleksiyamızı araşdırın
            </p>
          </div>
          
          <BookGrid />
        </div>
      </section>
    </div>
  )
}
