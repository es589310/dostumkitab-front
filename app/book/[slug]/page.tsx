import { Metadata } from "next"
import { getMediaUrl } from "@/lib/utils"

// Metadata funksiyası - server component-də işləyir
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    // Next.js 15-də params Promise olduğu üçün await etmək lazımdır
    const { slug } = await params
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Generating metadata for slug:', slug)
      console.log('🌐 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
      console.log('🏠 NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
    }
    
    // Production-da mütləq tam URL istifadə etməliyik
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dostumkitab.az'
    
    // API URL-i düzgün formatla - /api/books/ endpoint-i əlavə et
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/api'
    
    // Əgər API URL /api ilə bitmirsə, əlavə et
    if (!apiUrl.endsWith('/api')) {
      apiUrl = apiUrl.endsWith('/') ? `${apiUrl}api` : `${apiUrl}/api`
    }
    
    const fullApiUrl = `${apiUrl}/books/${slug}/`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 API URL:', apiUrl)
      console.log('📡 Full API URL:', fullApiUrl)
      console.log('🏠 Site URL:', siteUrl)
    }
    
    // Server-də API çağırışı - 60 saniyə cache əlavə edirik
    const response = await fetch(fullApiUrl, {
      next: { revalidate: 60 }
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 API Response Status:', response.status)
      console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()))
    }
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    const bookData = await response.json()
    if (process.env.NODE_ENV === 'development') {
      console.log('📚 Book Data:', {
        title: bookData.title,
        authors: bookData.authors,
        cover_image: bookData.cover_image,
        price: bookData.price
      })
    }
    
    const bookUrl = `${siteUrl}/book/${slug}`
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 Book URL:', bookUrl)
    }
    
    // Image URL-i düzgün formatla
    let imageUrl: string
    if (bookData.cover_image) {
      imageUrl = getMediaUrl(bookData.cover_image)
      console.log('🖼️ Original Image Path:', bookData.cover_image)
      console.log('🖼️ Processed Image URL:', imageUrl)
      
      // Əgər relative URL-dirsə, tam URL-ə çevir
      if (!imageUrl.startsWith('http')) {
        imageUrl = `${siteUrl}${imageUrl}`
        console.log('🖼️ Final Image URL:', imageUrl)
      }
    } else {
      imageUrl = `${siteUrl}/placeholder.svg`
      console.log('🖼️ Using placeholder image:', imageUrl)
    }
    
    // Authors məlumatını düzgün formatla
    const authorsText = bookData.authors && Array.isArray(bookData.authors) 
      ? bookData.authors.map((author: any) => author.name).join(', ')
      : bookData.authors || 'Müəllif məlumatı yoxdur'
    
    console.log('✍️ Authors Text:', authorsText)
    
    const metadata = {
      title: `${bookData.title} | DostumKitab.az`,
      description: `${bookData.title} kitabını online əldə edin. ${authorsText} tərəfindən yazılmış bu kitab ${bookData.price}₼ qiymətində DostumKitab.az-da!`,
      alternates: {
        canonical: bookUrl,
      },
      openGraph: {
        title: `${bookData.title} | DostumKitab.az`,
        description: `${bookData.title} kitabını online əldə edin. ${authorsText} tərəfindən yazılmış bu kitab ${bookData.price}₼ qiymətində DostumKitab.az-da!`,
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
    
    console.log('✅ Generated Metadata:', JSON.stringify(metadata, null, 2))
    return metadata
    
  } catch (error) {
    console.error('❌ Metadata generation error:', error)
    
    // Error halında da ən azından slug ilə URL yaradaq
    try {
      const { slug } = await params
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dostumkitab.az'
      const bookUrl = `${siteUrl}/book/${slug}`
      
      console.log('⚠️ Fallback metadata for slug:', slug)
      console.log('🔗 Fallback book URL:', bookUrl)
      
      return {
        title: `Kitab | Dostum Kitab`,
        description: 'Kitab məlumatları',
        openGraph: {
          title: 'Kitab | Dostum Kitab',
          description: 'Kitab məlumatları',
          url: bookUrl,
          siteName: 'Dostum Kitab',
          type: 'book',
        },
      }
    } catch (fallbackError) {
      console.error('❌ Fallback metadata error:', fallbackError)
      return {
        title: 'Kitab | Dostum Kitab',
        description: 'Kitab məlumatları',
      }
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
