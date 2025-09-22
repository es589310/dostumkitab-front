import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // API URL-i al
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/api'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dostumkitab.az'
    
    // XML sitemap başlanğıcı
    let xml = `<?xml version="1.0" encoding="UTF-8"?>`
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
    
    // Ana səhifə
    xml += `<url>
      <loc>${siteUrl}/</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>`
    
    // Statik səhifələr
    const staticPages = [
      '/categories',
      '/bestsellers', 
      '/new-books',
      '/discounts',
      '/contact',
      '/search'
    ]
    
    staticPages.forEach(page => {
      xml += `<url>
        <loc>${siteUrl}${page}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`
    })
    
    // Kitablar səhifələri
    try {
      const booksResponse = await fetch(`${apiUrl}/books/`, {
        next: { revalidate: 3600 } // 1 saat cache
      })
      
      if (booksResponse.ok) {
        const booksData = await booksResponse.json()
        const books = booksData.results || []
        
        books.forEach((book: any) => {
          xml += `<url>
            <loc>${siteUrl}/book/${book.slug}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.9</priority>
          </url>`
        })
      }
    } catch (error) {
      console.error('Kitablar sitemap-də xəta:', error)
    }
    
    // Kateqoriya səhifələri
    try {
      const categoriesResponse = await fetch(`${apiUrl}/categories/`, {
        next: { revalidate: 3600 } // 1 saat cache
      })
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        const categories = categoriesData.results || []
        
        categories.forEach((category: any) => {
          xml += `<url>
            <loc>${siteUrl}/category/${category.id}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>`
        })
      }
    } catch (error) {
      console.error('Kateqoriyalar sitemap-də xəta:', error)
    }
    
    xml += `</urlset>`
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1 saat cache
      },
    })
    
  } catch (error) {
    console.error('Sitemap yaradılarkən xəta:', error)
    
    // Xəta halında minimal sitemap
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dostumkitab.az'
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}