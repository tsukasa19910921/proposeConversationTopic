import './globals.css'
import { Poppins, Noto_Sans_JP } from 'next/font/google'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import ClientAnalytics from '@/components/ClientAnalytics'
import { ToastProvider, ToastPortal } from '@/hooks/useToast'
import type { Metadata, Viewport } from 'next'

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

const APP_NAME = 'QRプロフィール'
const APP_DESCRIPTION = 'QRコードで繋がり、AIが共通点から会話の話題を提案する高校生向けアプリ'
const APP_URL = process.env.APP_BASE_URL || 'https://proposeconversationtopic.vercel.app'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
}

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - 会話のきっかけを提案`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ['QRコード', 'プロフィール', '会話', '高校生', 'AI', '話題提案', 'コミュニケーション'],
  authors: [{ name: 'QRプロフィール開発チーム' }],
  creator: 'QRプロフィール開発チーム',
  publisher: 'QRプロフィール',
  applicationName: APP_NAME,
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} - 会話のきっかけを提案`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} - 会話のきっかけを提案`,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": APP_NAME,
    "description": APP_DESCRIPTION,
    "url": APP_URL,
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "ratingCount": "1"
    }
  };

  return (
    <html lang="ja" className={`${poppins.variable} ${notoSansJP.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans">
        <GoogleAnalytics />
        <ClientAnalytics />
        <ToastProvider>
          <main className="min-h-screen">
            {children}
          </main>
          <ToastPortal />
        </ToastProvider>
      </body>
    </html>
  )
}