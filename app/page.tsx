"use client"

import { useState } from "react"
import { HeroSection } from "@/components/hero-section"
import { FeaturedBooks } from "@/components/featured-books"
import { BookGrid } from "@/components/book-grid"

export default function HomePage() {
  const [globalSearchTerm, setGlobalSearchTerm] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("")

  const handleSearch = (term: string) => {
    setGlobalSearchTerm(term)
    setSelectedCategoryFilter("") // Axtarış edəndə kateqoriya filterini sıfırla
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryFilter(categoryId)
    setGlobalSearchTerm("") // Kateqoriya seçəndə axtarış terminini sıfırla
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <HeroSection />
        <FeaturedBooks />
        <BookGrid searchTerm={globalSearchTerm} categoryId={selectedCategoryFilter} />
      </main>
    </div>
  )
}
