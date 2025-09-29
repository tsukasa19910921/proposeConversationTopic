'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ScanContent() {
  const router = useRouter()
  const sp = useSearchParams()
  const sid = sp.get('sid') || ''
  const [state, setState] = useState<'checking'|'need-login'|'need-profile'|'scanning'|'done'|'error'>('checking')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!sid) {
        setState('error')
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

      setState('scanning')
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannedSid: sid })
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setMessage(data.message || '話題が見つかりました。ホームで続けましょう。')
        setState('done')
      } else if (res.status === 429) {
        setMessage(data.message || '時間をおいてトライしてください')
        setState('done')
      } else if (res.status === 400 && data.error === 'self_scan') {
        setMessage('自分のQRコードはスキャンできません')
        setState('done')
      } else if (res.status === 404) {
        setMessage('ユーザーが見つかりませんでした')
        setState('done')
      } else if (res.status === 503) {
        setMessage('サービスが一時的に利用できません。少し時間をおいて再試行してください。')
        setState('done')
      } else {
        setState('error')
      }
    }

    run()
  }, [sid])

  if (state === 'checking' || state === 'scanning') {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-bold mb-4">読み取り中...</h1>
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
        <a
          href="/"
          className="block w-full text-center py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ホームへ
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

  if (state === 'done') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">💬</div>
          <h1 className="text-xl font-bold">話題が見つかりました</h1>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border">
          <p className="text-gray-800">{message}</p>
        </div>
        <a
          href="/home"
          className="block w-full text-center py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          ホームへ
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold">読み取りに失敗しました</h1>
        <p className="text-gray-600 mt-2">QRコードが無効か、エラーが発生しました。</p>
      </div>
      <a
        href="/"
        className="block w-full text-center py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        ホームへ
      </a>
    </div>
  )
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