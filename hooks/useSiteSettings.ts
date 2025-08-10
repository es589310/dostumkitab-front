import { useState, useEffect } from 'react'

interface SiteSettings {
  site_name: string
  site_description: string
  navbar_logo: string
  navbar_logo_imagekit_url: string
  footer_logo: string
  footer_logo_imagekit_url: string
  phone: string
  email: string
  address: string
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://127.0.0.1:8000/api/contact/site-settings/')
        
        if (!response.ok) {
          throw new Error('Sayt tənzimləmələri yüklənə bilmədi')
        }
        
        const data = await response.json()
        setSettings(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Xəta baş verdi')
        console.error('Site settings error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading, error }
} 