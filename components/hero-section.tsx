"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  imagekit_url?: string;
  link?: string;
  is_active: boolean;
}

export function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bannerHeight, setBannerHeight] = useState(400) // Default height
  const [aspectRatio, setAspectRatio] = useState(16/9) // Default aspect ratio

  useEffect(() => {
    console.log("HeroSection: Banner API call started")
    console.log("HeroSection: API URL:", `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/books/banners/`)
    
    api.getBanners()
      .then((response: any) => {
        console.log("HeroSection: API response:", response)
        console.log("HeroSection: Response type:", typeof response)
        console.log("HeroSection: Response keys:", Object.keys(response || {}))
        
        // Check API response structure
        let bannerList = []
        if (response && typeof response === 'object') {
          if (Array.isArray(response)) {
            bannerList = response
            console.log("HeroSection: Response is array")
          } else if (response.results && Array.isArray(response.results)) {
            bannerList = response.results
            console.log("HeroSection: Response has results array")
          } else {
            console.log("HeroSection: Unexpected response structure")
          }
        }
        
        console.log("HeroSection: Processed banners:", bannerList)
        
        if (bannerList.length > 0) {
          console.log("HeroSection: Banners found:", bannerList.length)
          setBanners(bannerList)
        } else {
          console.log("HeroSection: No banners found")
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("HeroSection: API error:", err)
        console.error("HeroSection: Error details:", err.message, err.stack)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Handle image load to calculate dynamic height
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    const newAspectRatio = img.naturalWidth / img.naturalHeight
    setAspectRatio(newAspectRatio)
    
    const containerWidth = window.innerWidth
    
    // Calculate height based on image aspect ratio and container width
    const calculatedHeight = containerWidth / newAspectRatio
    
    // Set reasonable min/max heights
    const minHeight = 250
    const maxHeight = 600
    const finalHeight = Math.max(minHeight, Math.min(maxHeight, calculatedHeight))
    
    setBannerHeight(finalHeight)
  }

  // Handle window resize to recalculate banner height
  useEffect(() => {
    const handleResize = () => {
      if (banners.length > 0) {
        // Recalculate height when window resizes
        const containerWidth = window.innerWidth
        const calculatedHeight = containerWidth / aspectRatio
        const minHeight = 250
        const maxHeight = 600
        const finalHeight = Math.max(minHeight, Math.min(maxHeight, calculatedHeight))
        setBannerHeight(finalHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [banners.length, aspectRatio])

  // Auto carousel
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 5000) // Changes every 5 seconds

    return () => clearInterval(interval)
  }, [banners.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
  }

  if (loading) {
    return (
      <div className="relative w-full h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Banner yüklənir...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative w-full h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Banner yüklənərkən xəta baş verdi</p>
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-600 text-sm sm:text-base">
          <p>Banner tapılmadı</p>
        </div>
      </div>
    )
  }

  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{ height: `${bannerHeight}px` }}
    >
      <div className="flex w-full h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {banners.map((banner, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <img
              alt={banner.title}
              className="w-full h-full object-contain"
              src={banner.imagekit_url || banner.image}
              onLoad={handleImageLoad}
            />
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 hidden"></div>
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="text-center text-white z-10 max-w-4xl mx-auto">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {banner.title}
                </h1>
                {banner.subtitle && (
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 md:mb-6 opacity-90 leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
                {banner.link && (
                  <a 
                    href={banner.link} 
                    className="inline-block bg-white text-blue-600 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg text-xs sm:text-sm md:text-base"
                  >
                    Ətraflı
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <button 
        className="absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-1 sm:p-1.5 md:p-2 rounded-full transition-all duration-300"
        onClick={() => setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1)}
      >
        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <button 
        className="absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-1 sm:p-1.5 md:p-2 rounded-full transition-all duration-300"
        onClick={() => setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1)}
      >
        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      
      {/* Dots Indicator */}
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-1.5 md:space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
      

    </section>
  )
}
