import { Metadata } from "next"
import { getMediaUrl } from "@/lib/utils"

// Metadata funksiyası - server component-də işləyir
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    // Server-də API çağırışı
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/books/${params.slug}/`)
    if (!response.ok) {
      throw new Error('Kitab tapılmadı')
    }
    const bookData = await response.json()
    
    const bookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/book/${params.slug}`
    const imageUrl = bookData.cover_image ? getMediaUrl(bookData.cover_image) : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/placeholder.svg`
    
    return {
      title: `${bookData.title} | Dostum Kitab`,
      description: `${bookData.authors} - ${bookData.price}₼`,
      openGraph: {
        title: bookData.title,
        description: `${bookData.authors} - ${bookData.price}₼`,
        images: [imageUrl],
        url: bookUrl,
        type: 'website',
        siteName: 'Dostum Kitab',
      },
      twitter: {
        card: 'summary_large_image',
        title: bookData.title,
        description: `${bookData.authors} - ${bookData.price}₼`,
        images: [imageUrl],
      },
    }
  } catch (error) {
    return {
      title: 'Kitab | Dostum Kitab',
      description: 'Kitab məlumatları',
    }
  }
}

// Client component
import BookDetailClient from './book-detail-client'

export default function BookDetailPage({ params }: { params: { slug: string } }) {
  return <BookDetailClient slug={params.slug} />
} 
