'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import TopicModal from '@/components/TopicModal'
import Toast from '@/components/Toast'
import CameraScanner from '@/components/CameraScanner'

export default function HomePage() {
  const [qrData, setQrData] = useState<{ url: string; svg: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [topic, setTopic] = useState<string>('')
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [isTopicLoading, setIsTopicLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchQR()
  }, [])

  const fetchQR = async () => {
    try {
      const response = await fetch('/api/qr/me')

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setQrData(data)
      } else {
        showToast('QRコードの取得に失敗しました', 'error')
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
        body: JSON.stringify({ scannedSid }),
      })

      const data = await response.json()

      if (response.ok) {
        // 成功: モーダルの内容を更新
        setTopic(data.message)
        setIsTopicLoading(false)
        showToast('話題が見つかりました！', 'success')
      } else if (response.status === 429) {
        // クールダウン: モーダルを閉じてトーストで通知
        setIsTopicLoading(false)
        setShowTopicModal(false)
        showToast(data.message || '時間をおいてトライしてください ⏳', 'warning')
      } else if (response.status === 503) {
        // サービス一時利用不可
        setIsTopicLoading(false)
        setShowTopicModal(false)
        showToast(data.message || 'サービスが一時的に利用できません。少し時間をおいてから再度お試しください。', 'warning')
      } else if (response.status === 500 && data.error === 'generation_failed') {
        // 生成失敗
        setIsTopicLoading(false)
        setShowTopicModal(false)
        showToast(data.message || '話題の生成に失敗しました。もう一度QRコードを読み取ってください。', 'warning')
      } else if (response.status === 401) {
        setIsTopicLoading(false)
        setShowTopicModal(false)
        router.push('/auth/login')
      } else if (response.status === 400 && data.error === 'self_scan') {
        setIsTopicLoading(false)
        setShowTopicModal(false)
        showToast('自分のQRコードはスキャンできません', 'warning')
      } else if (response.status === 404) {
        setIsTopicLoading(false)
        setShowTopicModal(false)
        showToast('ユーザーが見つかりませんでした', 'error')
      } else {
        setIsTopicLoading(false)
        setShowTopicModal(false)
        showToast('スキャンに失敗しました', 'error')
      }
    } catch (error) {
      setIsTopicLoading(false)
      setShowTopicModal(false)
      showToast('ネットワークエラーが発生しました', 'error')
    }
  }, [router])

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
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      showToast('ログアウトに失敗しました', 'error')
    }
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
        <h1 className="text-xl font-bold text-gray-800">ホーム</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ログアウト
        </button>
      </div>

      {/* QRコード表示 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          あなたのQRコード
        </h2>
        {qrData ? (
          <div className="flex justify-center">
            <div
              className="w-48 h-48 border border-gray-200 rounded-lg p-2"
              dangerouslySetInnerHTML={{ __html: qrData.svg }}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-48 h-48 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
              <span className="text-gray-400">QRコード読み込み中...</span>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 text-center mt-2">
          このQRコードを相手に読み取ってもらいましょう
        </p>
      </div>

      {/* スキャンボタン */}
      <div className="space-y-3">
        <button
          onClick={() => setShowScanner(true)}
          className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium"
        >
          📱 相手のQRを読み取る
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