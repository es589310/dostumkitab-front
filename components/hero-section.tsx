"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

export function HeroSection() {
  const [banner, setBanner] = useState<any>(null)

  useEffect(() => {
    api.getBanners().then((banners) => {
      if (Array.isArray(banners) && banners.length > 0) {
        setBanner(banners[0]) // Ən son aktiv banneri göstər
      }
    })
  }, [])

  if (!banner) return null

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center bg-gray-100">
      <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
      <div className="relative z-10 text-center text-white">
        <h1 className="text-4xl font-bold">{banner.title}</h1>
        {banner.subtitle && <p className="mt-2 text-lg">{banner.subtitle}</p>}
        {banner.link && (
          <a href={banner.link} className="mt-4 inline-block bg-blue-600 px-6 py-2 rounded text-white font-semibold hover:bg-blue-700 transition">
            Ətraflı
          </a>
        )}
      </div>
      {/* Dekorativ dairələr */}
      <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
      <div className="absolute top-1/2 right-10 w-16 h-16 border-2 border-white rounded-full"></div>
    </div>
  )
}
