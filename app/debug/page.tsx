"use client"

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [siteSettings, setSiteSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://127.0.0.1:8000/api/contact/site-settings/')
        
        if (!response.ok) {
          throw new Error('Site settings yüklənə bilmədi')
        }
        
        const data = await response.json()
        setSiteSettings(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Xəta baş verdi')
        console.error('Site settings error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSiteSettings()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Debug Səhifəsi</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Site Settings API Test</h2>
        
        {loading && (
          <div className="text-gray-600">Yüklənir...</div>
        )}
        
        {error && (
          <div className="text-red-600 bg-red-100 p-4 rounded">
            Xəta: {error}
          </div>
        )}
        
        {siteSettings && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Site Name:</h3>
                <p className="text-gray-900">{siteSettings.site_name}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Site Description:</h3>
                <p className="text-gray-900">{siteSettings.site_description || 'Boş'}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Navbar Logo:</h3>
                <p className="text-gray-900">{siteSettings.navbar_logo}</p>
                {siteSettings.navbar_logo_imagekit_url && (
                  <div className="mt-2">
                    <img 
                      src={siteSettings.navbar_logo_imagekit_url} 
                      alt="Navbar Logo" 
                      className="h-20 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Footer Logo:</h3>
                <p className="text-gray-900">{siteSettings.footer_logo}</p>
                {siteSettings.footer_logo_imagekit_url && (
                  <div className="mt-2">
                    <img 
                      src={siteSettings.footer_logo_imagekit_url} 
                      alt="Footer Logo" 
                      className="h-20 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Phone:</h3>
                <p className="text-gray-900">{siteSettings.phone || 'Boş'}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Email:</h3>
                <p className="text-gray-900">{siteSettings.email || 'Boş'}</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h3 className="font-medium text-gray-700 mb-2">Raw API Response:</h3>
              <pre className="text-sm text-gray-800 overflow-auto">
                {JSON.stringify(siteSettings, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
