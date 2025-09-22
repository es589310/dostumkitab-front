import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { BookOpen, Home, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Səhifə Tapılmadı | DostumKitab.az',
  description: 'Axtardığınız səhifə tapılmadı. DostumKitab.az-da kitablarınızı tapın və oxuyun.',
  robots: 'noindex, nofollow',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Səhifə Tapılmadı
          </h2>
          <p className="text-gray-600 mb-8">
            Üzr istəyirik, axtardığınız səhifə mövcud deyil. 
            Bəlkə də səhifə köçürülüb və ya silinib.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Home className="h-4 w-4 mr-2" />
              Ana Səhifəyə Qayıt
            </Button>
          </Link>
          
          <Link href="/search">
            <Button variant="outline" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Kitab Axtar
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Faydalı linklər:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/categories" className="text-blue-600 hover:underline">
              Kateqoriyalar
            </Link>
            <Link href="/bestsellers" className="text-blue-600 hover:underline">
              Ən Çox Satılanlar
            </Link>
            <Link href="/new-books" className="text-blue-600 hover:underline">
              Yeni Kitablar
            </Link>
            <Link href="/contact" className="text-blue-600 hover:underline">
              Əlaqə
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}