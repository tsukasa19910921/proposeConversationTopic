'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Toast from '@/components/Toast'

interface MetricsData {
  scanOut: number
  scanIn: number
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData>({ scanOut: 0, scanIn: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })
  const router = useRouter()

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics/me')

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      } else {
        showToast('実績の取得に失敗しました', 'error')
      }
    } catch (error) {
      showToast('ネットワークエラーが発生しました', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-4 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-20 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">実績</h1>
        <button
          onClick={fetchMetrics}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          更新
        </button>
      </div>

      {/* 実績カード */}
      <div className="space-y-4">
        {/* 読み取り回数 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">📱</span>
                <h2 className="text-lg font-semibold text-gray-800">読み取り回数</h2>
              </div>
              <p className="text-sm text-gray-600">
                あなたが他の人のQRコードを読み取った回数
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-500">{metrics.scanOut}</div>
              <div className="text-sm text-gray-500">回</div>
            </div>
          </div>
        </div>

        {/* 読み取られ回数 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">✨</span>
                <h2 className="text-lg font-semibold text-gray-800">読み取られ回数</h2>
              </div>
              <p className="text-sm text-gray-600">
                他の人があなたのQRコードを読み取った回数
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-500">{metrics.scanIn}</div>
              <div className="text-sm text-gray-500">回</div>
            </div>
          </div>
        </div>

        {/* 総合実績 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md p-6 text-white">
          <div className="text-center">
            <div className="text-2xl mb-2">🏆</div>
            <h2 className="text-lg font-semibold mb-2">総合実績</h2>
            <div className="text-2xl font-bold mb-1">
              {metrics.scanOut + metrics.scanIn}
            </div>
            <div className="text-sm opacity-90">
              総交流回数
            </div>
            <div className="mt-4 text-xs opacity-75">
              QRコードを通じて{metrics.scanOut + metrics.scanIn}回の出会いがありました！
            </div>
          </div>
        </div>

        {/* メッセージ */}
        <div className="text-center">
          {metrics.scanOut + metrics.scanIn === 0 ? (
            <p className="text-gray-500 text-sm">
              まだ交流がありません。<br />
              ホーム画面からQRコードを読み取って、<br />
              新しい出会いを始めましょう！
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              素晴らしい交流実績です！<br />
              引き続き新しい出会いを楽しんでください。
            </p>
          )}
        </div>
      </div>

      {/* ナビゲーション */}
      <Navigation />

      {/* トースト */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}