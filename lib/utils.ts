import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Dil adını Azərbaycan dilində göstərmək üçün ümumi funksiya
export function getLanguageName(languageCode: string): string {
  const languageMap: { [key: string]: string } = {
    'az': 'Azərbaycan dili',
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
    'id': 'İndoneziya dili'
  }
  
  return languageMap[languageCode] || languageCode
}

// Media URL'ini düzəltmək üçün helper funksiya
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) {
    return "/placeholder.svg"
  }
  
  // Əgər path artıq tam URL-dirsə, onu qaytar
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Əgər path /media/ ilə başlayırsa, backend URL'ini əlavə et
  if (path.startsWith('/media/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    return `${backendUrl}${path}`
  }
  
  // Əgər path media/ ilə başlayırsa (səhifə ilə), backend URL'ini əlavə et
  if (path.startsWith('media/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    return `${backendUrl}/${path}`
  }
  
  // Əgər ImageKit ID-dirsə, ImageKit URL-ini yarat
  if (path.includes('imagekit')) {
    const imagekitUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL || 'https://ik.imagekit.io/g51py75hl'
    return `${imagekitUrl}/books/covers/${path}`
  }
  
  // Əgər heç biri deyilsə, placeholder qaytar
  return "/placeholder.svg"
}
