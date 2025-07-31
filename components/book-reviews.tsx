"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import api, { type BookReview } from "@/lib/api"

interface BookReviewsProps {
  bookId: number
  bookSlug: string
}

export function BookReviews({ bookId, bookSlug }: BookReviewsProps) {
  const [reviews, setReviews] = useState<BookReview[]>([])
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    fetchReviews()
  }, [bookId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      console.log("Fetching reviews for book ID:", bookId)
      const data = await api.getBookReviews(bookId)
      console.log("Reviews data received:", data)
      setReviews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      alert("Rəy yazmaq üçün giriş etməlisiniz!")
      return
    }

    if (userRating === 0) {
      alert("Zəhmət olmasa reytinq seçin!")
      return
    }

    if (!userComment.trim()) {
      alert("Zəhmət olmasa rəy yazın!")
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Submitting review:", { bookId, userRating, userComment })
      
      // Rəyi gönder
      const newReview = await api.createReview(bookId, userRating, userComment)
      console.log("New review created:", newReview)
      
      // Yeni rəyi hemen listeye ekle
      if (newReview && typeof newReview === 'object') {
        setReviews(prevReviews => [newReview, ...prevReviews])
        alert("Rəyiniz uğurla əlavə edildi!")
      } else {
        console.warn("Unexpected review response:", newReview)
        // Rəyləri yeniden yükle
        await fetchReviews()
        alert("Rəyiniz əlavə edildi!")
      }
      
      // Form'u təmizlə
      setUserRating(0)
      setUserComment("")
      setShowReviewForm(false)
      
    } catch (error: any) {
      console.error("Failed to submit review:", error)
      
      // Error mesajını daha detaylı göster
      let errorMessage = "Rəy əlavə edilərkən xəta baş verdi!"
      
      if (error.message) {
        if (error.message.includes("duplicate")) {
          errorMessage = "Bu kitab üçün artıq rəy yazmısınız!"
        } else if (error.message.includes("JSON")) {
          errorMessage = "Server xətası baş verdi. Zəhmət olmasa yenidən cəhd edin."
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 cursor-pointer ${
              i < rating ? "fill-current" : ""
            } ${interactive ? "hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onStarClick?.(i + 1)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Rəylər ({reviews.length})</h3>
        {isAuthenticated && (
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant="outline"
          >
            {showReviewForm ? "Rəy yazmağı ləğv et" : "Rəy yaz"}
          </Button>
        )}
      </div>

      {/* Rəy yazma formu */}
      {showReviewForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rəy yazın</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reytinq</label>
                {renderStars(userRating, true, setUserRating)}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rəyiniz</label>
                <Textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Kitab haqqında fikirlərinizi yazın..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || userRating === 0 || !userComment.trim()}
                >
                  {isSubmitting ? "Göndərilir..." : "Rəy göndər"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserRating(0)
                    setUserComment("")
                    setShowReviewForm(false)
                  }}
                >
                  Ləğv et
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mövcud rəylər */}
      {loading ? (
        <div className="text-center py-8">Yüklənir...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Bu kitab üçün hələ rəy yazılmayıb. İlk rəyi siz yazın!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">
                      {review.user_name || `İstifadəçi ${review.user}`}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('az-AZ')}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 