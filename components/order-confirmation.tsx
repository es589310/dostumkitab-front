"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, X, Phone } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { getMediaUrl } from "@/lib/utils"

interface OrderConfirmationProps {
  isOpen: boolean
  onClose: () => void
}

export function OrderConfirmation({ isOpen, onClose }: OrderConfirmationProps) {
  const { cart, getTotalPrice, clearCart } = useCart()
  const [isConfirming, setIsConfirming] = useState(false)
  const [whatsappNumber, setWhatsAppNumber] = useState("+994501234567")
  
  // WhatsApp nömrəsini API-dən al
  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const response = await api.getWhatsAppNumber()
        setWhatsAppNumber(response.whatsapp_number)
      } catch (error) {
        console.error('WhatsApp nömrəsi alınmadı:', error)
      }
    }
    
    if (isOpen) {
      fetchWhatsAppNumber()
    }
  }, [isOpen])

  if (!isOpen) return null

  const items = cart?.items || []
  const totalPrice = getTotalPrice()
  const whatsappMessage = `Salam! Kitab sifarişi vermək istəyirəm.

Sifariş məlumatları:
${items.map(item => {
  const bookUrl = `${window.location.origin}/book/${item.book.slug}`
  const imageUrl = getMediaUrl(item.book.cover_image)
  return `- ${item.book.title} (${item.quantity} ədəd)
  Link: ${bookUrl}
  ${imageUrl ? `Şəkil: ${imageUrl}` : ''}`
}).join('\n\n')}

Ümumi məbləğ: ${totalPrice.toFixed(2)}₼

Sifariş linki: ${window.location.origin}/cart

Təşəkkürlər!`

  const handleConfirmOrder = async () => {
    setIsConfirming(true)
    
    // WhatsApp-a yönləndir
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, '_blank')
    
    // Səbəti təmizlə
    await clearCart()
    
    // Pəncərəni bağla
    setTimeout(() => {
      onClose()
      setIsConfirming(false)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Sifariş Təsdiqi
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Sifariş Məhsulları:</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                      <img
                        src={getMediaUrl(item.book.cover_image)}
                        alt={item.book.title}
                        className="h-20 w-16 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{item.book.title}</h4>
                        <p className="text-xs text-gray-600">{item.book.authors.map((a) => a.name).join(", ")}</p>
                        <p className="text-sm font-semibold text-green-600">{item.book.price}₼</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-600">Miqdar: {item.quantity}</span>
                        <p className="text-sm font-semibold text-green-600">
                          {(item.book.price * item.quantity).toFixed(2)}₼
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Ümumi Məbləğ:</span>
                  <span className="text-xl font-bold text-green-600">{totalPrice.toFixed(2)}₼</span>
                </div>
              </div>

              {/* WhatsApp Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">WhatsApp ilə sifariş</span>
                </div>
                <p className="text-sm text-blue-700">
                  Sifarişinizi təsdiqləmək üçün WhatsApp-a yönləndiriləcəksiniz. 
                  Satış nömrəsi: <span className="font-semibold">{whatsappNumber}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 space-y-3">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              size="lg"
              onClick={handleConfirmOrder}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  WhatsApp-a yönləndirilir...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Sifarişi Təsdiqlə
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onClose}
              disabled={isConfirming}
            >
              Geri Qayıt
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 