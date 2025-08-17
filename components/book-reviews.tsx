"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface BookReview {
  id: number
  user_name: string
  user?: number
  rating: number
  comment: string
  created_at: string
}

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
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [bookId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      console.log("Fetching reviews for book ID:", bookId)
      const data = await api.getBookReviews(bookId)
      console.log("Reviews data received:", data)
      
      // Check API response structure
      let reviewsData = data
      if (data && typeof data === 'object' && 'results' in data) {
        reviewsData = data.results
      } else if (Array.isArray(data)) {
        reviewsData = data
      } else {
        reviewsData = []
      }
      
      setReviews(reviewsData)
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      toast({
        title: "⚠️ Reytinq Seçilməyib",
        description: "Zəhmət olmasa reytinq seçin!",
        variant: "destructive",
      })
      return
    }

    if (!userComment.trim()) {
      toast({
        title: "⚠️ Rəy Yazılmayıb",
        description: "Zəhmət olmasa rəy yazın!",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Submitting review:", { bookId, userRating, userComment })
      
      // Submit the review
      const newReview = await api.createBookReview(bookId, {
        rating: userRating,
        comment: userComment
      })
      console.log("New review created:", newReview)
      
      // Add new review to list immediately
      if (newReview && typeof newReview === 'object') {
        setReviews(prevReviews => [newReview, ...prevReviews])
        toast({
          title: "🎉 Rəy Uğurla Əlavə Edildi!",
          description: "Rəyiniz kitab üçün uğurla əlavə edildi.",
          variant: "success",
        })
      } else {
        console.warn("Unexpected review response:", newReview)
        // Reload reviews
        await fetchReviews()
        toast({
          title: "✅ Rəy Əlavə Edildi",
          description: "Rəyiniz uğurla əlavə edildi.",
          variant: "success",
        })
      }
      
      // Clear the form
      setUserRating(0)
      setUserComment("")
      setShowReviewForm(false)
      
    } catch (error: any) {
      console.error("Failed to submit review:", error)
      
      let errorMessage = "Rəy əlavə edilərkən xəta baş verdi!"
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      toast({
        title: "❌ Xəta Baş Verdi",
        description: errorMessage,
        variant: "destructive",
      })
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
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          variant="outline"
        >
          {showReviewForm ? "Rəy yazmağı ləğv et" : "Rəy yaz"}
        </Button>
      </div>

      {/* Review writing form */}
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

      {/* Existing reviews */}
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