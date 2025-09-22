'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })
  const router = useRouter()

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

  const handleScanResult = async (scannedSid: string) => {
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
        setTopic(data.message)
        setShowTopicModal(true)
        showToast('スキャン成功！', 'success')
      } else if (response.status === 429) {
        showToast(data.message || '時間をおいてトライしてください', 'warning')
      } else if (response.status === 401) {
        router.push('/auth/login')
      } else if (response.status === 400 && data.error === 'self_scan') {
        showToast('自分のQRコードはスキャンできません', 'warning')
      } else if (response.status === 404) {
        showToast('ユーザーが見つかりませんでした', 'error')
      } else {
        showToast('スキャンに失敗しました', 'error')
      }
    } catch (error) {
      showToast('ネットワークエラーが発生しました', 'error')
    }
  }

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
        onClose={() => setShowTopicModal(false)}
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