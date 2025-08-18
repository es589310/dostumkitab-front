import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { HeaderWrapper } from '@/components/header'
import { NavigationBar } from '@/components/navigation-bar'
import { Footer } from '@/components/footer'
import { AuthProvider } from '@/contexts/auth-context'
import { CartProvider } from '@/contexts/cart-context'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dostum Kitab - Azərbaycanın Ən Böyük Onlayn Kitab Mağazası',
  description: 'Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti.',
  keywords: 'kitab, kitab mağazası, online kitab, Azərbaycan, dostum kitab',
  authors: [{ name: 'Dostum Kitab' }],
  creator: 'Dostum Kitab',
  publisher: 'Dostum Kitab',
  robots: 'index, follow',
  openGraph: {
    title: 'Dostum Kitab - Azərbaycanın Ən Böyük Onlayn Kitab Mağazası',
    description: 'Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti.',
    url: 'https://dostumkitab.az',
    siteName: 'Dostum Kitab',
    locale: 'az_AZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dostum Kitab - Azərbaycanın Ən Böyük Onlayn Kitab Mağazası',
    description: 'Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1f2937',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="az">
      <head>
        {/* FontAwesome CDN */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {/* Web Header - Always Visible */}
            <HeaderWrapper />
            <NavigationBar />
            
            <main className="min-h-screen">
              {children}
            </main>
            
            <Footer />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
