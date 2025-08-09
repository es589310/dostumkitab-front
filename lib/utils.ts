import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  
  // Əgər heç biri deyilsə, placeholder qaytar
  return "/placeholder.svg"
}
