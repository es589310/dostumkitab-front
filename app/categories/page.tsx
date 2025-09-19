"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Metadata } from "next"
import api, { type Category, type CategoriesResponse } from "@/lib/api"
import { Breadcrumb, BreadcrumbSchema } from "@/components/breadcrumb"

export const metadata: Metadata = {
  title: 'Kitab Kateqoriyaları | DostumKitab.az',
  description: 'Maraqlandığınız sahədəki kitabları kəşf edin. Hər kateqoriyada minlərlə keyfiyyətli kitab. DostumKitab.az-da geniş kitab kolleksiyası.',
  keywords: 'kitab kateqoriyaları, ədəbiyyat, din, fəlsəfə, uşaq kitabları, kitab mağazası',
}
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowRight, Library, BookMarked, Users, Heart, Star, Zap } from "lucide-react"
import Link from "next/link"

// Kateqoriya ikonları
const categoryIcons: { [key: string]: any } = {
  'Din': BookMarked,
  'Fəlsəfə': Library,
  'Uşaqlar': Users,
  'default': BookOpen
}

// Kateqoriya rəngləri
const categoryColors: { [key: string]: string } = {
  'Din': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  'Fəlsəfə': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  'Uşaqlar': 'bg-green-50 border-green-200 hover:bg-green-100',
  'default': 'bg-gray-50 border-gray-200 hover:bg-gray-100'
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await api.getCategories()
        if (Array.isArray(data)) {
          setCategories(data)
        } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as CategoriesResponse).results)) {
          setCategories((data as CategoriesResponse).results)
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setError("Kateqoriyalar yüklənərkən xəta baş verdi")
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/category/${categoryId}`)
  }

  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || categoryIcons['default']
  }

  const getCategoryColor = (categoryName: string) => {
    return categoryColors[categoryName] || categoryColors['default']
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kateqoriyalar yüklənir...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Xəta</h1>
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Yenidən cəhd et
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Kateqoriyalar' }
        ]}
        className="mb-8"
      />
      
      {/* Structured Data */}
      <BreadcrumbSchema 
        items={[
          { label: 'Kateqoriyalar' }
        ]}
      />
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <Library className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kitab Kateqoriyaları</h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Maraqlandığınız sahədəki kitabları kəşf edin. Hər kateqoriyada minlərlə keyfiyyətli kitab
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Kateqoriya tapılmadı</h2>
          <p className="text-gray-600">Hal-hazırda heç bir kateqoriya mövcud deyil.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.name)
            const colorClass = getCategoryColor(category.name)
            
            return (
              <Card 
                key={category.id} 
                className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 ${colorClass}`}
                onClick={() => handleCategoryClick(category.id.toString())}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full mb-3 sm:mb-4 shadow-sm">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-center space-x-2">
                      {category.books_count && category.books_count > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          {category.books_count} kitab
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          Yeni
                        </Badge>
                      )}
                      
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="text-center mt-12">
        <Link href="/">
          <Button variant="outline" className="mr-4">
            Ana səhifəyə qayıt
          </Button>
        </Link>
        <Link href="/search">
          <Button>
            Bütün kitabları gör
          </Button>
        </Link>
      </div>
    </div>
  )
} 