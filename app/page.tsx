"use client"


import { HeroSection } from "@/components/hero-section"
import { BookGrid } from "@/components/book-grid"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
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
