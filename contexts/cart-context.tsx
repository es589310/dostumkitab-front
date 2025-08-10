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
  totalItems: number
  setIsCartOpen: (isOpen: boolean) => void
  notification: { message: string; type: 'success' | 'error' } | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

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
      console.log('Adding item to cart:', bookId, quantity)
      const response = await api.addToCart(bookId, quantity)
      
      // Cart-i dərhal yenilə
      if (response && response.cart) {
        console.log('Cart response received:', response.cart)
        
        // Cart state-ini dərhal yenilə
        setCart(response.cart)
        
        // Success notification göstər
        showNotification('Kitab səbətə əlavə edildi!', 'success')
        
        // State yenilənməsini təmin et
        console.log('Cart state set, total items:', response.cart.total_items)
      } else {
        console.log('No cart in response, reloading cart')
        // Əgər response-da cart yoxdursa, yenidən yüklə
        await loadCart()
      }
    } catch (error: any) {
      console.error('Səbətə əlavə edərkən xəta:', error)
      
      // Stok xətasını yoxla
      if (error.message && error.message.includes('Stokda yalnız')) {
        // Stok xətası - cart-i yenidən yükləmə
        await loadCart()
        showNotification(error.message, 'error')
        // Stok hatası durumunda hata fırlatma, sadece notification göster
        return
      }
      
      // Xəta halında da cart-i yenidən yüklə
      await loadCart()
      throw error
    }
  }

  // Item-i yenilə
  const updateItem = async (itemId: number, quantity: number) => {
    try {
      console.log('Updating cart item:', itemId, 'quantity:', quantity)
      const response = await api.updateCartItem(itemId, quantity)
      console.log('Update response:', response)
      await loadCart()
      
      // Success notification göstər
      showNotification('Səbət yeniləndi!', 'success')
    } catch (error: any) {
      console.error('Item yenilənərkən xəta:', error)
      
      // Stok xətasını yoxla
      if (error.message && error.message.includes('Stokda yalnız')) {
        // Stok xətası - cart-i yenidən yükləmə və notification göstər
        await loadCart()
        showNotification(error.message, 'error')
        // Stok hatası durumunda hata fırlatma, sadece notification göster
        return
      }
      
      // Digər xətaları yenidən fırlat
      throw error
    }
  }

  // Item-i sil
  const removeItem = async (itemId: number) => {
    try {
      console.log('Removing cart item:', itemId)
      const response = await api.removeCartItem(itemId)
      console.log('Remove response:', response)
      await loadCart()
    } catch (error: any) {
      console.error('Item silinərkən xəta:', error)
      throw error
    }
  }

  // Notification göstər
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    // 5 saniyə sonra notification-i gizlət
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // Səbəti təmizlə
  const clearCart = async () => {
    try {
      await api.clearCart()
      setCart(null)
    } catch (error) {
      console.error('Səbət təmizlənərkən xəta:', error)
      // Xəta halında da state-i təmizlə
      setCart(null)
    }
  }

  // Ümumi item sayı
  const getTotalItems = () => {
    if (!cart) return 0
    
    // Əgər total_items varsa onu istifadə et, yoxdursa items array-indən hesabla
    if (cart.total_items !== undefined) {
      console.log('Using total_items from cart:', cart.total_items)
      return cart.total_items
    }
    
    // Items array-indən hesabla
    const calculatedTotal = cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
    console.log('Calculated total from items:', calculatedTotal)
    return calculatedTotal
  }
  
  // Cart state-inin yenilənməsini izlə
  useEffect(() => {
    console.log('Cart context: Cart state changed:', cart)
    if (cart) {
      console.log('Cart context: Total items:', getTotalItems())
    }
  }, [cart])

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
    totalItems: getTotalItems(), // Add totalItems to the context value
    setIsCartOpen: (isOpen) => {
      // This function is not implemented in the original file,
      // but it's part of the new interface.
      // For now, it's a placeholder.
      console.log('setIsCartOpen called with:', isOpen);
    },
    notification,
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
