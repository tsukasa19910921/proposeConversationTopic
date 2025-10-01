import './globals.css'
import { Poppins, Noto_Sans_JP } from 'next/font/google'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import ClientAnalytics from '@/components/ClientAnalytics'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-jp',
})

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
    <html lang="ja" className={`${poppins.variable} ${notoSansJP.variable}`}>
      <body className="font-sans">
        <GoogleAnalytics />
        <ClientAnalytics />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}