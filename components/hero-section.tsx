"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

export function HeroSection() {
  const [banners, setBanners] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          <p className="mt-4 text-gray-600">Loading banner...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative w-full h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-600">
          <p>No banners found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {/* Banner Slider Container */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            {banner.image ? (
              <img 
                src={banner.image} 
                alt={banner.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white z-10">
                <h1 className="text-4xl font-bold mb-4">{banner.title}</h1>
                {banner.subtitle && (
                  <p className="text-xl mb-6 opacity-90">{banner.subtitle}</p>
                )}
                {banner.link && (
                  <a 
                    href={banner.link} 
                    className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
                  >
                    Ətraflı
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {banners.length > 1 && (
        <>
          {/* Left button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-white rounded-full opacity-20"></div>
      <div className="absolute top-1/2 right-10 w-16 h-16 border-2 border-white rounded-full opacity-20"></div>
    </div>
  )
}
