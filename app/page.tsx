"use client"

import { useState } from "react"
import { HeroSection } from "@/components/hero-section"
import { FeaturedBooks } from "@/components/featured-books"
import { BookGrid } from "@/components/book-grid"
import { AuthModal } from "@/components/auth-modal"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [globalSearchTerm, setGlobalSearchTerm] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("")

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  const handleSearch = (term: string) => {
    setGlobalSearchTerm(term)
    setSelectedCategoryFilter("") // Axtarış edəndə kateqoriya filterini sıfırla
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryFilter(categoryId)
    setGlobalSearchTerm("") // Kateqoriya seçəndə axtarış terminini sıfırla
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <main>
            <HeroSection />
            <FeaturedBooks />
            <BookGrid searchTerm={globalSearchTerm} categoryId={selectedCategoryFilter} />
          </main>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            mode={authMode}
            onModeChange={setAuthMode}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
