"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api, { type Cart } from "@/lib/api"
import { useAuth } from "./auth-context"

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  addItem: (bookId: number, quantity?: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  refreshCart: () => Promise<void>
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart()
    } else {
      setCart(null)
    }
  }, [isAuthenticated, user])

  const refreshCart = async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      const cartData = await api.getCart()
      setCart(cartData)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (bookId: number, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error("Səbətə əlavə etmək üçün giriş etməlisiniz!")
    }

    try {
      setIsLoading(true)
      const response = await api.addToCart(bookId, quantity)
      setCart(response.cart)
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateItem = async (itemId: number, quantity: number) => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      if (quantity <= 0) {
        await removeItem(itemId)
        return
      }
      const response = await api.updateCartItem(itemId, quantity)
      setCart(response.cart)
    } catch (error) {
      console.error("Failed to update cart item:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (itemId: number) => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      await api.removeFromCart(itemId)
      await refreshCart()
    } catch (error) {
      console.error("Failed to remove item from cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalPrice = () => {
    return cart ? Number.parseFloat(cart.total_price) : 0
  }

  const getTotalItems = () => {
    return cart ? cart.total_items : 0
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        refreshCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
