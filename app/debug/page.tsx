"use client"

import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function DebugPage() {
  const { settings, loading, error } = useSiteSettings()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Logo Debug Səyfəsi</h1>
        
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Yüklənir...
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Xəta: {error}
          </div>
        )}
        
        {settings && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Site Settings</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(settings, null, 2)}
              </pre>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Logo Test</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Navbar Logo */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Navbar Logo</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">ImageKit URL:</p>
                      <p className="text-xs text-gray-500 break-all">
                        {settings.navbar_logo_imagekit_url || 'Yoxdur'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Local URL:</p>
                      <p className="text-xs text-gray-500 break-all">
                        {settings.navbar_logo || 'Yoxdur'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">ImageKit Logo:</p>
                      {settings.navbar_logo_imagekit_url ? (
                        <img
                          src={settings.navbar_logo_imagekit_url}
                          alt="Navbar Logo (ImageKit)"
                          className="max-w-full h-20 object-contain border border-gray-300 rounded"
                          onError={(e) => {
                            console.log('ImageKit navbar logo yüklenemedi')
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : (
                        <p className="text-gray-500">ImageKit URL yoxdur</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Local Logo:</p>
                      {settings.navbar_logo ? (
                        <img
                          src={`http://127.0.0.1:8000${settings.navbar_logo}`}
                          alt="Navbar Logo (Local)"
                          className="max-w-full h-20 object-contain border border-gray-300 rounded"
                        />
                      ) : (
                        <p className="text-gray-500">Local logo yoxdur</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer Logo */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Footer Logo</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">ImageKit URL:</p>
                      <p className="text-xs text-gray-500 break-all">
                        {settings.footer_logo_imagekit_url || 'Yoxdur'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Local URL:</p>
                      <p className="text-xs text-gray-500 break-all">
                        {settings.footer_logo || 'Yoxdur'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">ImageKit Logo:</p>
                      {settings.footer_logo_imagekit_url ? (
                        <img
                          src={settings.footer_logo_imagekit_url}
                          alt="Footer Logo (ImageKit)"
                          className="max-w-full h-20 object-contain border border-gray-300 rounded"
                          onError={(e) => {
                            console.log('ImageKit footer logo yüklenemedi')
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : (
                        <p className="text-gray-500">ImageKit URL yoxdur</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Local Logo:</p>
                      {settings.footer_logo ? (
                        <img
                          src={`http://127.0.0.1:8000${settings.footer_logo}`}
                          alt="Footer Logo (Local)"
                          className="max-w-full h-20 object-contain border border-gray-300 rounded"
                        />
                      ) : (
                        <p className="text-gray-500">Local logo yoxdur</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
