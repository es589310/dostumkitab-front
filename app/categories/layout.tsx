import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kitab Kateqoriyaları | DostumKitab.az',
  description: 'Maraqlandığınız sahədəki kitabları kəşf edin. Hər kateqoriyada minlərlə keyfiyyətli kitab. DostumKitab.az-da geniş kitab kolleksiyası.',
  keywords: 'kitab kateqoriyaları, ədəbiyyat, din, fəlsəfə, uşaq kitabları, kitab mağazası',
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}