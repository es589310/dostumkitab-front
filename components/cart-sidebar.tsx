"use client"

import { Button } from "@/components/ui/button"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"
import { OrderConfirmation } from "./order-confirmation"
import { getMediaUrl } from "@/lib/utils"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, updateItem, removeItem, getTotalPrice, loading, notification } = useCart()
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false)

  if (!isOpen) return null

  const items = cart?.items || []
  const totalPrice = getTotalPrice()

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateItem(itemId, quantity)
    } catch (error) {
      console.error("Failed to update quantity:", error)
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId)
    } catch (error) {
      console.error("Failed to remove item:", error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Alış-veriş səbəti</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Səbət yüklənir...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Səbətiniz boşdur</p>
                <p className="text-sm text-gray-400">Kitab əlavə etmək üçün kataloqa baxın</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.book.id}-${item.quantity}`} className="flex items-center space-x-3 border-b pb-4">
                    <img
                      src={getMediaUrl(item.book.cover_imagekit_url || item.book.cover_image)}
                      alt={item.book.title}
                      className="h-20 w-16 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm line-clamp-2">{item.book.title}</h3>
                      <p className="text-xs text-gray-600">{item.book.authors.map((a) => a.name).join(", ")}</p>
                      <p className="text-sm font-semibold text-green-600">{item.book.price}₼</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="h-6 w-6 p-0"
                          disabled={loading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                          disabled={loading}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 text-xs px-3 py-1 rounded-full"
                        disabled={loading}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Cəmi:</span>
                <span className="text-xl font-bold text-green-600">{totalPrice.toFixed(2)}₼</span>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setIsOrderConfirmationOpen(true)}
              >
                Sifarişi Tamamla
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Order Confirmation Modal */}
      <OrderConfirmation 
        isOpen={isOrderConfirmationOpen}
        onClose={() => setIsOrderConfirmationOpen(false)}
      />
    </div>
  )
}
