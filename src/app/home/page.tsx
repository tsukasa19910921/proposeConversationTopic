'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { LogOut, Scan } from 'lucide-react'
import TopicModal from '@/components/TopicModal'
import CameraScanner from '@/components/CameraScanner'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useToast } from '@/hooks/useToast'
import { useApi } from '@/hooks/useApi'

function HomeContent() {
  const [qrData, setQrData] = useState<{ url: string; svg: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [topic, setTopic] = useState<string>('')
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [isTopicLoading, setIsTopicLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { show } = useToast()
  const { json } = useApi()

  useEffect(() => {
    fetchQR()
  }, [])

  const fetchQR = async () => {
    try {
      const data = await json<{ url: string; svg: string }>('/api/qr/me')
      setQrData(data)
    } catch (error: any) {
      show('QRコードの取得に失敗しました', 'error')
    } finally {
      setIsLoading(false)
    }
  }


  const handleScanResult = useCallback(async (scannedSid: string) => {
    // 即座に処理中モーダルを表示
    setIsTopicLoading(true)
    setTopic('')
    setShowTopicModal(true)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Added for better cookie handling
        body: JSON.stringify({ scannedSid }),
      })

      const data = await response.json()

      if (response.ok) {
        // 成功: モーダルの内容を更新
        setTopic(data.message)
        setIsTopicLoading(false)
        show('話題が見つかりました！', 'success')
      } else if (response.status === 429) {
        // クールダウン: モーダルを閉じてトーストで通知
        setIsTopicLoading(false)
        setShowTopicModal(false)
        show(data.message || '時間をおいてトライしてください ⏳', 'warning')
      } else if (response.status === 503) {
        // サービス一時利用不可
        setIsTopicLoading(false)
        setShowTopicModal(false)
        show(data.message || 'サービスが一時的に利用できません。少し時間をおいてから再度お試しください。', 'warning')
      } else if (response.status === 500 && data.error === 'generation_failed') {
        // 生成失敗
        setIsTopicLoading(false)
        setShowTopicModal(false)
        show(data.message || '話題の生成に失敗しました。もう一度QRコードを読み取ってください。', 'warning')
      } else if (response.status === 401) {
        setIsTopicLoading(false)
        setShowTopicModal(false)
        router.push('/auth/login')
      } else if (response.status === 400 && data.error === 'self_scan') {
        setIsTopicLoading(false)
        setShowTopicModal(false)
        show('自分のQRコードはスキャンできません', 'warning')
      } else if (response.status === 404) {
        setIsTopicLoading(false)
        setShowTopicModal(false)
        show('ユーザーが見つかりませんでした', 'error')
      } else {
        setIsTopicLoading(false)
        setShowTopicModal(false)
        show('スキャンに失敗しました', 'error')
      }
    } catch (error) {
      setIsTopicLoading(false)
      setShowTopicModal(false)
      show('ネットワークエラーが発生しました', 'error')
    }
  }, [router, show])

  // URL経由のスキャン処理
  useEffect(() => {
    const scannedSid = searchParams.get('scannedSid')
    if (scannedSid && !isLoading) {
      // URLパラメータをクリア
      router.replace('/home')
      // スキャン処理を実行
      handleScanResult(scannedSid)
    }
  }, [searchParams, isLoading, router, handleScanResult])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Added for better cookie handling
      })
      router.push('/')
    } catch (error) {
      show('ログアウトに失敗しました', 'error')
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600">
      {/* メインコンテンツ */}
      <div className="max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4 pt-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">ホーム</h1>
            <p className="text-white/80 text-xs sm:text-sm">QRコードで新しい出会いを</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 backdrop-blur-lg bg-white/20 rounded-full
                     hover:bg-white/30 transition-all duration-300 transform hover:scale-110
                     shadow-lg group"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>

        {/* QRカード */}
        <div className="backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl p-4 mb-6
                      transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="text-center mb-3">
            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent mb-1">
              あなたのQRコード
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">友達に読み取ってもらおう</p>
          </div>

          {qrData ? (
            <div className="bg-white rounded-lg p-2 sm:p-3 shadow-inner flex items-center justify-center aspect-square">
              <div
                className="qr-container w-full max-w-[260px] sm:max-w-[300px] aspect-square"
                dangerouslySetInnerHTML={{ __html: qrData.svg }}
                style={{
                  display: 'block'
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* スキャンボタン */}
        <button
          onClick={() => setShowScanner(true)}
          className="w-full py-3 px-4 rounded-xl font-bold text-white text-base sm:text-lg
                   bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500
                   transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95
                   shadow-xl backdrop-blur-md relative overflow-hidden group"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                          -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
          <span className="relative flex items-center justify-center gap-2">
            <Scan className="w-5 h-5" />
            相手のQRコードを読み取る
          </span>
        </button>
      </div>

      {/* ナビゲーション */}
      <Navigation />

      {/* カメラスキャナー */}
      <CameraScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />

      {/* モーダル */}
      <TopicModal
        isOpen={showTopicModal}
        message={topic}
        isBusy={isTopicLoading}
        title={isTopicLoading ? 'QRコード読み取り完了' : '会話の話題'}
        subtitle={isTopicLoading ? 'AIが話題を生成しています' : undefined}
        onClose={() => {
          setShowTopicModal(false)
          setIsTopicLoading(false)
        }}
      />

    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  )
}