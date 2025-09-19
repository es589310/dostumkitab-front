import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yeni Kitablar | DostumKitab.az',
  description: 'Yeni çıxan kitabları kəşf edin. DostumKitab.az-da ən son nəşr olunan kitablar ən yaxşı qiymətlərlə!',
  keywords: 'yeni kitablar, yeni nəşr kitablar, yeni çıxan kitablar, kitab mağazası',
}

export default function NewBooksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}