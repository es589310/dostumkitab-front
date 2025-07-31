"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "./header"
import { AuthModal } from "./auth-modal"

export function HeaderWrapper() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const router = useRouter()

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  const handleSearch = (term: string) => {
    if (term.trim()) {
      router.push(`/search?query=${encodeURIComponent(term)}`)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/category/${categoryId}`)
  }

  return (
    <>
      <Header 
        onAuthClick={openAuthModal} 
        onSearch={handleSearch} 
        onCategorySelect={handleCategorySelect} 
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
} 