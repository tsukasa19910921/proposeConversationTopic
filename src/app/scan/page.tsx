'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QrCode, Lock, User, Home, Loader2 } from 'lucide-react'
import Link from 'next/link'

function ScanContent() {
  const router = useRouter()
  const sp = useSearchParams()
  const sid = sp.get('sid') || ''
  const [state, setState] = useState<'checking'|'need-login'|'need-profile'|'redirecting'>('checking')

  useEffect(() => {
    const run = async () => {
      if (!sid) {
        // sidがない場合はホームにリダイレクト
        router.push('/home')
        return
      }

      // 認証とプロフィール完了状態を確認
      const me = await fetch('/api/me', {
        credentials: 'include', // Added for better cookie handling
      })
      if (me.status === 401) {
        setState('need-login')
        return
      }

      const user = await me.json().catch(() => ({}))
      if (!user.profileCompleted) {
        setState('need-profile')
        return
      }

      // ホームページにリダイレクトしてモーダル表示
      setState('redirecting')
      router.push(`/home?scannedSid=${encodeURIComponent(sid)}`)
    }

    run()
  }, [sid])

  if (state === 'checking' || state === 'redirecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-4">
          <div className="backdrop-blur-lg bg-white/90 rounded-3xl shadow-2xl p-8
                        transform transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full mb-6 shadow-lg">
                <QrCode className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent mb-3">
                {state === 'redirecting' ? 'ホームへ移動中...' : 'QRコード読み取り中...'}
              </h1>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
              <p className="text-gray-600 text-sm">処理を行っています。しばらくお待ちください。</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'need-login') {
    const next = encodeURIComponent(`/scan?sid=${sid}`)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-4">
          <div className="backdrop-blur-lg bg-white/90 rounded-3xl shadow-2xl p-8
                        transform transition-all duration-300 hover:scale-[1.02]">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full mb-4 shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent mb-3">
                ログインが必要です
              </h1>
              <p className="text-gray-600 text-sm">
                QRコードの内容を確認するにはサインインしてください。
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href={`/auth/login?next=${next}`}
                className="block w-full py-4 px-6 rounded-2xl font-bold text-white text-lg
                         bg-gradient-to-r from-purple-500 via-pink-500 to-teal-500
                         transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                         active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                                -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                <span className="relative">ログイン</span>
              </Link>

              <Link
                href={`/auth/signup?next=${next}`}
                className="block w-full py-4 px-6 rounded-2xl font-bold text-gray-700 text-lg
                         backdrop-blur-lg bg-white/60 border-2 border-white/50
                         transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white/80
                         active:scale-95"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'need-profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-4">
          <div className="backdrop-blur-lg bg-white/90 rounded-3xl shadow-2xl p-8
                        transform transition-all duration-300 hover:scale-[1.02]">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-gradient-to-br from-pink-500 to-teal-500 rounded-full mb-4 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-teal-500 bg-clip-text text-transparent mb-3">
                プロフィール設定が必要です
              </h1>
              <p className="text-gray-600 text-sm">
                会話を始めるにはプロフィール設定が必要です。
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/profile?from=scan"
                className="block w-full py-4 px-6 rounded-2xl font-bold text-white text-lg
                         bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500
                         transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                         active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                                -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                <span className="relative flex items-center justify-center gap-3">
                  <User className="w-5 h-5" />
                  プロフィールを設定する
                </span>
              </Link>

              <Link
                href="/home"
                className="block w-full py-4 px-6 rounded-2xl font-bold text-gray-700 text-lg
                         backdrop-blur-lg bg-white/60 border-2 border-white/50
                         transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white/80
                         active:scale-95 text-center"
              >
                <span className="flex items-center justify-center gap-3">
                  <Home className="w-5 h-5" />
                  ホームへ
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 他の状態では何も表示しない（リダイレクト処理中）
  return null
}

export default function ScanLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-medium">読み込み中...</p>
        </div>
      </div>
    }>
      <ScanContent />
    </Suspense>
  )
}