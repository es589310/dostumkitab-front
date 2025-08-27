import { Metadata } from "next"
import { getMediaUrl } from "@/lib/utils"

// Metadata funksiyası - server component-də işləyir
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    // Next.js 15-də params Promise olduğu üçün await etmək lazımdır
    const { slug } = await params
    
    // Server-də API çağırışı - 60 saniyə cache əlavə edirik
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/books/${slug}/`, {
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      throw new Error('Kitab tapılmadı')
    }
    
    const bookData = await response.json()
    
    // Production-da mütləq tam URL istifadə etməliyik
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dostumkitab.az'
    const bookUrl = `${siteUrl}/book/${slug}`
    
    // Image URL-i düzgün formatla
    let imageUrl: string
    if (bookData.cover_image) {
      imageUrl = getMediaUrl(bookData.cover_image)
      // Əgər relative URL-dirsə, tam URL-ə çevir
      if (!imageUrl.startsWith('http')) {
        imageUrl = `${siteUrl}${imageUrl}`
      }
    } else {
      imageUrl = `${siteUrl}/placeholder.svg`
    }
    
    // Authors məlumatını düzgün formatla
    const authorsText = bookData.authors && Array.isArray(bookData.authors) 
      ? bookData.authors.map((author: any) => author.name).join(', ')
      : bookData.authors || 'Müəllif məlumatı yoxdur'
    
    return {
      title: `${bookData.title} | Dostum Kitab`,
      description: `${authorsText} - ${bookData.price}₼`,
      openGraph: {
        title: bookData.title,
        description: `${authorsText} - ${bookData.price}₼`,
        url: bookUrl,
        siteName: 'Dostum Kitab',
        type: 'book',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: bookData.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: bookData.title,
        description: `${authorsText} - ${bookData.price}₼`,
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    return {
      title: 'Kitab | Dostum Kitab',
      description: 'Kitab məlumatları',
    }
  }
}

// Client component
import BookDetailClient from './book-detail-client'

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 15-də params Promise olduğu üçün await etmək lazımdır
  const { slug } = await params
  return <BookDetailClient slug={slug} />
} 
