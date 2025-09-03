"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { type Book } from '@/lib/api'
import CartDrawer from '@/components/cart-drawer'

interface CartItem {
  id: number
  book: Book
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
  shouldOpenCart: boolean
  setShouldOpenCart: (shouldOpen: boolean) => void
  notification: { message: string; type: 'success' | 'error' } | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [shouldOpenCart, setShouldOpenCart] = useState(false)
  const { toast } = useToast()

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
        
        // Success toast notification göstər
        toast({
          title: "Səbətə əlavə edildi! 🛒",
          description: "Kitab uğurla səbətinizə əlavə edildi. Səbəti açmaq üçün buraya basın.",
          variant: "success",
          duration: 5000,
          onClick: () => {
            console.log('Toast clicked, opening cart...')
            setShouldOpenCart(true)
          }
        })
        
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
        toast({
          title: "Xəta! ⚠️",
          description: error.message,
          variant: "destructive",
          duration: 5000,
        })
        // Stok hatası durumunda hata fırlatma, sadece notification göster
        return
      }
      
      // Xəta halında da cart-i yenidən yüklə
      await loadCart()
      toast({
        title: "Xəta! ❌",
        description: "Kitab səbətə əlavə edilərkən xəta baş verdi.",
        variant: "destructive",
        duration: 5000,
      })
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
      toast({
        title: "Səbət yeniləndi! 🛒",
        description: "Səbət uğurla yeniləndi.",
        variant: "success",
        duration: 3000,
      })
    } catch (error: any) {
      console.error('Item yenilənərkən xəta:', error)
      
      // Stok xətasını yoxla
      if (error.message && error.message.includes('Stokda yalnız')) {
        // Stok xətası - cart-i yenidən yükləmə və notification göstər
        await loadCart()
        toast({
          title: "Xəta! ⚠️",
          description: error.message,
          variant: "destructive",
          duration: 5000,
        })
        // Stok hatası durumunda hata fırlatma, sadece notification göster
        return
      }
      
      // Digər xətaları yenidən fırlat
      toast({
        title: "Xəta! ❌",
        description: "Səbət yenilənərkən xəta baş verdi.",
        variant: "destructive",
        duration: 5000,
      })
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
      toast({
        title: "Xəta! ❌",
        description: "Səbətdən kitab silinərkən xəta baş verdi.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    }
  }

  // Səbəti təmizlə
  const clearCart = async () => {
    try {
      await api.clearCart()
      setCart(null)
      toast({
        title: "Səbət təmizləndi! 🛒",
        description: "Səbət uğurla təmizləndi.",
        variant: "success",
        duration: 3000,
      })
    } catch (error) {
      console.error('Səbət təmizlənərkən xəta:', error)
      // Xəta halında da state-i təmizlə
      setCart(null)
      toast({
        title: "Xəta! ❌",
        description: "Səbət təmizlənərkən xəta baş verdi.",
        variant: "destructive",
        duration: 5000,
      })
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
    setIsCartOpen: (isOpen) => setShouldOpenCart(isOpen),
    shouldOpenCart,
    setShouldOpenCart,
    notification,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
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
