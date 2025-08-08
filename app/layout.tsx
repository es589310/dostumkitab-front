import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Footer } from '@/components/footer'
import { AuthProvider } from '@/contexts/auth-context'
import { CartProvider } from '@/contexts/cart-context'
import { HeaderWrapper } from '@/components/header-wrapper'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <HeaderWrapper />
              <main className="flex-1">
                {children}
              </main>
              <Footer key="main-footer" />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
