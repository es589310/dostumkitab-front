import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ən Çox Satılan Kitablar | DostumKitab.az',
  description: 'Ən çox satılan və populyar kitabları kəşf edin. DostumKitab.az-da ən məşhur kitablar ən yaxşı qiymətlərlə!',
  keywords: 'ən çox satılan kitablar, populyar kitablar, bestseller kitablar, kitab mağazası',
}

export default function BestsellersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}