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
        console.log('Fetching site settings from:', 'http://127.0.0.1:8000/api/settings/site-settings/')
        
        // Tam site settings məlumatlarını al
        const settingsResponse = await fetch('http://127.0.0.1:8000/api/settings/site-settings/')
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          console.log('Site settings data received:', settingsData)
          
          // Site settings məlumatlarını formatla
          const combinedData = {
            site_name: settingsData.site_name || "Fəzilət Kitab",
            site_description: settingsData.site_description || "Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti.",
            navbar_logo: settingsData.navbar_logo || "",
            navbar_logo_imagekit_url: settingsData.navbar_logo_imagekit_url || "",
            footer_logo: settingsData.footer_logo || "",
            footer_logo_imagekit_url: settingsData.footer_logo_imagekit_url || "",
            phone: settingsData.phone || "+994 12 345 67 89",
            email: settingsData.email || "info@faziletkitab.az",
            address: settingsData.address || "Bakı, Azərbaycan"
          }
          console.log('Combined data:', combinedData)
          setSettings(combinedData)
        } else {
          console.log('Settings response not ok:', settingsResponse.status, settingsResponse.statusText)
          // Settings yüklənə bilməsə, default məlumatları istifadə et
          const defaultData = {
            site_name: "Fəzilət Kitab",
            site_description: "Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti.",
            navbar_logo: "",
            navbar_logo_imagekit_url: "",
            footer_logo: "",
            footer_logo_imagekit_url: "",
            phone: "+994 12 345 67 89",
            email: "info@faziletkitab.az",
            address: "Bakı, Azərbaycan"
          }
          setSettings(defaultData)
        }
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Xəta baş verdi')
        console.error('Site settings error:', err)
        
        // Xəta baş verdikdə də default məlumatları istifadə et
        const defaultData = {
          site_name: "Fəzilət Kitab",
          site_description: "Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti.",
          navbar_logo: "",
          navbar_logo_imagekit_url: "",
          footer_logo: "",
          footer_logo_imagekit_url: "",
          phone: "+994 12 345 67 89",
          email: "info@faziletkitab.az",
          address: "Bakı, Azərbaycan"
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