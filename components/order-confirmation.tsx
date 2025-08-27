"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, X, Phone } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useState, useEffect } from "react"
import api, { type Book } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface OrderConfirmationProps {
  isOpen: boolean
  onClose: () => void
}

export function OrderConfirmation({ isOpen, onClose }: OrderConfirmationProps) {
  const { cart, getTotalPrice, clearCart } = useCart()
  const [isConfirming, setIsConfirming] = useState(false)
  const [whatsappNumber, setWhatsAppNumber] = useState("+994501234567")
  const { toast } = useToast()
  
  // Get WhatsApp number from API
  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const response = await api.getWhatsAppNumber()
        setWhatsAppNumber(response.whatsapp_number)
      } catch (error) {
        console.error('Failed to get WhatsApp number:', error)
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

📚 Sifariş məlumatlarınız

${items.map((item) => {
  const bookUrl = `${window.location.origin}/book/${item.book.slug}`
  const authorsText = item.book.authors?.map((author) => author.name).join(", ") || "Məlumat yoxdur"
  
  return `📖 ${item.book.title}
📊 Miqdar: ${item.quantity} ədəd
💰 Qiymət: ${item.book.price}₼
✍️ Müəllif: ${authorsText}
🔗 ${bookUrl}`
}).join('\n\n')}

💳 Ümumi məbləğ: ${totalPrice.toFixed(2)}₼

Təşəkkürlər! 👍`

  const handleConfirmOrder = async () => {
    setIsConfirming(true)
    
    try {
      // Create order in backend
      const orderData = {
        delivery_name: 'WhatsApp',
        delivery_phone: '0000000000',
        delivery_address_text: 'WhatsApp-də təyin ediləcək',
        payment_method: 'cash',
        notes: 'WhatsApp sifarişi'
      }
      
      const orderResponse = await api.createOrder(orderData)
      console.log('Order created:', orderResponse)
      
      // Prepare WhatsApp number in correct format
      const cleanWhatsAppNumber = whatsappNumber.replace(/[^0-9]/g, '')
      const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`
      
      // Redirect to WhatsApp after order is successfully created
      window.open(whatsappUrl, '_blank')
      
      // Clear cart
      await clearCart()
      
      // Show success notification
      toast({
        title: "🎉 Sifariş Uğurla Yaradıldı!",
        description: "Sifarişiniz təsdiqləndi və WhatsApp-a yönləndirildiniz.",
        variant: "success",
      })
      
      // Close window
      setTimeout(() => {
        onClose()
        setIsConfirming(false)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error creating order:', error)
      
              // Show error notification
      toast({
        title: "❌ Xəta Baş Verdi",
        description: error.message || 'Sifariş yaradılarkən xəta baş verdi!',
        variant: "destructive",
      })
      
      setIsConfirming(false)
    }
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
                        src={item.book.cover_image || "/placeholder.svg"}
                        alt={item.book.title}
                        className="h-20 w-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{item.book.title}</h4>
                        <p className="text-xs text-gray-600">{item.book.authors?.map((a) => a.name).join(", ") || "Məlumat yoxdur"}</p>
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
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800 text-lg">WhatsApp ilə Sifariş</span>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Sifarişinizi təsdiqləmək üçün WhatsApp-a yönləndiriləcəksiniz. 
                  Satış nömrəsi: <span className="font-semibold text-green-800">{whatsappNumber}</span>
                </p>
                
                {/* Simple Order Process */}
                <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">💡</span>
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-2">Sadə Sifariş Prosesi:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Düyməyə basın və WhatsApp-a yönləndirilin</li>
                        <li>WhatsApp-da çatdırılma məlumatlarınızı yazın</li>
                        <li>Satış nümayəndəsi sizinlə əlaqə saxlayacaq</li>
                        <li>Sifarişiniz təsdiqlənəcək və çatdırılacaq</li>
                      </ol>
                    </div>
                  </div>
                </div>
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
                  WhatsApp ilə Sifariş Et
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