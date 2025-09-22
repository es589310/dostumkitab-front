import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { HeaderWrapper } from '@/components/header'
import { NavigationBar } from '@/components/navigation-bar'
import { Footer } from '@/components/footer'
import { AuthProvider } from '@/contexts/auth-context'
import { CartProvider } from '@/contexts/cart-context'
import { Toaster } from '@/components/ui/toaster'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'DostumKitab.az – Azərbaycan dilində ən yaxşı kitablar',
  description: 'Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti. DostumKitab.az-da kitablarınızı tapın!',
  keywords: 'kitab, kitab mağazası, online kitab, Azərbaycan, dostum kitab, kitab satışı, ədəbiyyat, dini kitablar',
  authors: [{ name: 'Dostum Kitab' }],
  creator: 'Dostum Kitab',
  publisher: 'Dostum Kitab',
  robots: 'index, follow',
  verification: {
    google: 'sr29C49SiQuO_v3HLfppLLR5a1cKRXFcoMsLiv9LL0g',
  },
  openGraph: {
    title: 'DostumKitab.az – Azərbaycan dilində ən yaxşı kitablar',
    description: 'Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti. DostumKitab.az-da kitablarınızı tapın!',
    url: 'https://dostumkitab.az',
    siteName: 'Dostum Kitab',
    locale: 'az_AZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DostumKitab.az – Azərbaycan dilində ən yaxşı kitablar',
    description: 'Azərbaycanda ən böyük onlayn kitab mağazası. Minlərlə kitab, ən yaxşı qiymətlər və sürətli çatdırılma xidməti. DostumKitab.az-da kitablarınızı tapın!',
  },
  icons: {
    icon: '/camlicalogo.png',
    shortcut: '/camlicalogo.png',
    apple: '/camlicalogo.png',
  },
  alternates: {
    canonical: 'https://dostumkitab.az',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#66cc00',
  colorScheme: 'light',
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
      <body className={poppins.className}>
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
