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
  coordinates?: string
  working_hours?: string
  copyright_year?: number
  whatsapp_number?: string
  social_media_links?: Array<{
    platform: string
    url: string
    icon_class: string
    is_active: boolean
    is_hidden: boolean
    order: number
  }>
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        
        // Environment variable-dan API URL-ni al
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
        
        console.log('Fetching site settings, logo and social media data...')
        
        // Paralel olaraq bütün məlumatları al
        const [settingsResponse, logoResponse, socialMediaResponse] = await Promise.all([
          fetch(`${apiUrl}/settings/site-settings/`),
          fetch(`${apiUrl}/settings/logo/`),
          fetch(`${apiUrl}/contact/social-links/`)
        ])
        
        let settingsData: any = {}
        let logoData: any = {}
        let socialMediaData: any = { links: [] }
        
        if (settingsResponse.ok) {
          settingsData = await settingsResponse.json()
          console.log('Site settings data received:', settingsData)
        }
        
        if (logoResponse.ok) {
          logoData = await logoResponse.json()
          console.log('Logo data received:', logoData)
        }
        
        if (socialMediaResponse.ok) {
          socialMediaData = await socialMediaResponse.json()
          console.log('Social media data received:', socialMediaData)
        }
        
        // Bütün məlumatları birləşdir
        const combinedData = {
          site_name: settingsData.site_name || logoData.site_name || "Fəzilət Kitab",
          site_description: settingsData.site_description || "Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti.",
          navbar_logo: logoData.navbar_logo || "",
          navbar_logo_imagekit_url: logoData.navbar_logo_imagekit_url || "",
          footer_logo: logoData.footer_logo || "",
          footer_logo_imagekit_url: logoData.footer_logo_imagekit_url || "",
          phone: settingsData.phone || "+994 12 345 67 89",
          email: settingsData.email || "info@faziletkitab.az",
          address: settingsData.address || "Bakı, Azərbaycan",
          coordinates: settingsData.coordinates || "",
          working_hours: settingsData.working_hours || "Bazar ertəsi - Cümə: 09:00-18:00",
          copyright_year: settingsData.copyright_year || new Date().getFullYear(),
          whatsapp_number: settingsData.whatsapp_number || "+994 12 345 67 89",
          social_media_links: socialMediaData.links || []
        }
        
        console.log('Combined data:', combinedData)
        setSettings(combinedData)
        setError(null)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Xəta baş verdi')
        console.error('Site settings error:', err)
        
        // Use default data even when error occurs
        const defaultData = {
          site_name: "Fəzilət Kitab",
          site_description: "Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti.",
          navbar_logo: "",
          navbar_logo_imagekit_url: "",
          footer_logo: "",
          footer_logo_imagekit_url: "",
          phone: "+994 12 345 67 89",
          email: "info@faziletkitab.az",
          address: "Bakı, Azərbaycan",
          coordinates: "",
          working_hours: "Bazar ertəsi - Cümə: 09:00-18:00",
          copyright_year: new Date().getFullYear(),
          whatsapp_number: "+994 12 345 67 89",
          social_media_links: []
        }
        setSettings(defaultData)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading, error }
} 