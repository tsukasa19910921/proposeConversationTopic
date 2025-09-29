'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
      const me = await fetch('/api/me')
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
      <div className="max-w-md mx-auto p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-bold mb-4">{state === 'redirecting' ? 'ホームへ移動中...' : '読み取り中...'}</h1>
          <p className="text-gray-600">処理を行っています。しばらくお待ちください。</p>
        </div>
      </div>
    )
  }

  if (state === 'need-login') {
    const next = encodeURIComponent(`/scan?sid=${sid}`)
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-bold">ログインが必要です</h1>
          <p className="text-gray-600 mt-2">QRコードの内容を確認するにはサインインしてください。</p>
        </div>
        <a
          href={`/auth/login?next=${next}`}
          className="block w-full text-center py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          ログイン
        </a>
        <a
          href={`/auth/signup?next=${next}`}
          className="block w-full text-center py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          新規登録
        </a>
      </div>
    )
  }

  if (state === 'need-profile') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">📝</div>
          <h1 className="text-xl font-bold">プロフィール設定が必要です</h1>
          <p className="text-gray-600 mt-2">会話を始めるにはプロフィール設定が必要です。</p>
        </div>
        <a
          href="/profile?from=scan"
          className="block w-full text-center py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          プロフィールを設定する
        </a>
        <a
          href="/home"
          className="block w-full text-center py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ホームへ
        </a>
      </div>
    )
  }

  // 他の状態では何も表示しない（リダイレクト処理中）
  return null
}

export default function ScanLandingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ScanContent />
    </Suspense>
  )
}