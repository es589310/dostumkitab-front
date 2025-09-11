import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Dil adını Azərbaycan dilində göstərmək üçün ümumi funksiya
export function getLanguageName(languageCode: string): string {
  const languageMap: { [key: string]: string } = {
    'az': 'Azərbaycan dili',
    'az_ru': 'Azərbaycan və Rus dili',
    'tr': 'Türk dili',
    'ru': 'Rus dili',
    'ar': 'Ərəb dili',
    'en': 'İngilis dili',
    'fr': 'Fransız dili',
    'de': 'Alman dili',
    'es': 'İspan dili',
    'it': 'İtalyan dili',
    'pt': 'Portuqal dili',
    'ja': 'Yapon dili',
    'ko': 'Koreya dili',
    'zh': 'Çin dili',
    'hi': 'Hind dili',
    'fa': 'Fars dili',
    'ur': 'Urdu dili',
    'bn': 'Benqal dili',
    'th': 'Tay dili',
    'vi': 'Vyetnam dili',
    'id': 'İndoneziya dili',
    'other': 'Digər'
  }
  
  return languageMap[languageCode] || languageCode
}

// Media URL'ini düzəltmək üçün helper funksiya
export function getMediaUrl(path: string | null | undefined): string {
  console.log('🖼️ getMediaUrl input:', path)
  
  if (!path) {
    console.log('🖼️ No path provided, using placeholder')
    return "/placeholder.svg"
  }
  
  // Əgər path artıq tam URL-dirsə, onu qaytar
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('🖼️ Path is already absolute URL:', path)
    return path
  }
  
  // Əgər path /media/ ilə başlayırsa, backend URL'ini əlavə et
  if (path.startsWith('/media/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/api'
    const fullUrl = `${backendUrl.replace('/api', '')}${path}`
    console.log('🖼️ Media path with /media/, full URL:', fullUrl)
    return fullUrl
  }
  
  // Əgər path media/ ilə başlayırsa (səhifə ilə), backend URL'ini əlavə et
  if (path.startsWith('media/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/api'
    const fullUrl = `${backendUrl.replace('/api', '')}/${path}`
    console.log('🖼️ Media path with media/, full URL:', fullUrl)
    return fullUrl
  }
  
  // Əgər ImageKit URL-dirsə, onu olduğu kimi qaytar
  if (path.includes('imagekit') || path.includes('ik.imagekit.io')) {
    console.log('🖼️ ImageKit URL detected, returning as is:', path)
    return path
  }
  
  // Əgər heç biri deyilsə, placeholder qaytar
  console.log('🖼️ Unknown path format, using placeholder')
  return "/placeholder.svg"
}
