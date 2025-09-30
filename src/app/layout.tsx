import './globals.css'
import { Inter } from 'next/font/google'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import ClientAnalytics from '@/components/ClientAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'QRプロフィール×話題提示',
  description: '高校生向けQR交換アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <GoogleAnalytics />
        <ClientAnalytics />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}