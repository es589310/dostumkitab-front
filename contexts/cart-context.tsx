"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '@/lib/api'

interface CartItem {
  id: number
  book: {
    id: number
    title: string
    price: number
    cover_image?: string
  }
  quantity: number
  total_price: number
}

interface Cart {
  id: number
  items: CartItem[]
  total_price: number
  total_items: number
}

interface CartContextType {
  cart: Cart | null
  loading: boolean
  addItem: (bookId: number, quantity?: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  // Cart-i yüklə
  const loadCart = async () => {
    try {
      setLoading(true)
      const cartData = await api.getCart()
      setCart(cartData)
    } catch (error) {
      console.error('Cart yüklənərkən xəta:', error)
      setCart(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  // Səbətə əlavə et
  const addItem = async (bookId: number, quantity: number = 1) => {
    try {
      await api.addToCart(bookId, quantity)
      await loadCart() // Cart-i yenidən yüklə
    } catch (error: any) {
      console.error('Səbətə əlavə edərkən xəta:', error)
      throw error
    }
  }

  // Item-i yenilə
  const updateItem = async (itemId: number, quantity: number) => {
    try {
      await api.updateCartItem(itemId, quantity)
      await loadCart()
    } catch (error: any) {
      console.error('Item yenilənərkən xəta:', error)
      throw error
    }
  }

  // Item-i sil
  const removeItem = async (itemId: number) => {
    try {
      await api.removeCartItem(itemId)
      await loadCart()
    } catch (error: any) {
      console.error('Item silinərkən xəta:', error)
      throw error
    }
  }

  // Səbəti təmizlə
  const clearCart = () => {
    setCart(null)
  }

  // Ümumi item sayı
  const getTotalItems = () => {
    return cart?.total_items || 0
  }

  // Ümumi qiymət
  const getTotalPrice = () => {
    return cart?.total_price || 0
  }

  const value: CartContextType = {
    cart,
    loading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
