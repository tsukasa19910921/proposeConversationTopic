'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Toast from '@/components/Toast'
import { RefreshCw, QrCode, Users, Trophy, Sparkles, TrendingUp } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-medium">読み込み中...</p>
        </div>
      </div>
    )
  }

  // アニメーション用のカウントアップ効果
  const AnimatedNumber = ({ value, delay = 0 }: { value: number; delay?: number }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      const timer = setTimeout(() => {
        const increment = Math.ceil(value / 20)
        let current = 0
        const interval = setInterval(() => {
          current += increment
          if (current >= value) {
            setDisplayValue(value)
            clearInterval(interval)
          } else {
            setDisplayValue(current)
          }
        }, 50)
        return () => clearInterval(interval)
      }, delay)
      return () => clearTimeout(timer)
    }, [value, delay])

    return <>{displayValue}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600">
      <div className="max-w-md mx-auto p-4 pb-32">
        <div className="flex justify-between items-center mb-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">実績</h1>
            <p className="text-white/80 text-sm">あなたの交流記録</p>
          </div>
          <button
            onClick={fetchMetrics}
            className="p-3 backdrop-blur-lg bg-white/20 rounded-full
                     hover:bg-white/30 transition-all duration-300 transform hover:scale-110
                     shadow-lg group"
          >
            <RefreshCw className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* 実績カード */}
        <div className="space-y-4">
          {/* 読み取り回数 */}
          <div className="backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl p-6
                        transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full shadow-lg">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
                    読み取り回数
                  </h2>
                </div>
                <p className="text-sm text-gray-600 ml-14">
                  他の人のQRコードをスキャン
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
                  <AnimatedNumber value={metrics.scanOut} delay={200} />
                </div>
                <div className="text-sm text-gray-500 font-medium">回</div>
              </div>
            </div>
            {/* プログレスバー風の装飾 */}
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((metrics.scanOut / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* 読み取られ回数 */}
          <div className="backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl p-6
                        transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">
                    読み取られ回数
                  </h2>
                </div>
                <p className="text-sm text-gray-600 ml-14">
                  あなたのQRコードが読まれた数
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">
                  <AnimatedNumber value={metrics.scanIn} delay={400} />
                </div>
                <div className="text-sm text-gray-500 font-medium">回</div>
              </div>
            </div>
            {/* プログレスバー風の装飾 */}
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((metrics.scanIn / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* 総合実績 */}
          <div className="relative backdrop-blur-lg bg-gradient-to-r from-purple-500/90 via-pink-500/90 to-yellow-400/90
                        rounded-2xl shadow-2xl p-8 text-white overflow-hidden
                        transform transition-all duration-300 hover:scale-[1.02]">
            {/* 背景の光エフェクト */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative text-center">
              <div className="inline-flex p-4 bg-white/20 rounded-full mb-4 backdrop-blur-md">
                <Trophy className="w-10 h-10 text-yellow-300 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold mb-3 drop-shadow-lg">総合実績</h2>
              <div className="text-5xl font-bold mb-2 drop-shadow-lg">
                <AnimatedNumber value={metrics.scanOut + metrics.scanIn} delay={600} />
              </div>
              <div className="text-sm font-medium mb-4 opacity-90">
                総交流回数
              </div>

              {/* スパークルエフェクト */}
              <div className="flex justify-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse delay-100" />
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse delay-200" />
              </div>

              <div className="text-xs font-medium opacity-80 leading-relaxed">
                QRコードを通じて<br />
                <span className="text-lg font-bold">{metrics.scanOut + metrics.scanIn}</span>回の素晴らしい出会いがありました！
              </div>
            </div>
          </div>

          {/* メッセージ */}
          <div className="text-center mt-6 backdrop-blur-lg bg-white/10 rounded-2xl p-6 shadow-lg">
            {metrics.scanOut + metrics.scanIn === 0 ? (
              <div>
                <TrendingUp className="w-12 h-12 text-white/70 mx-auto mb-3" />
                <p className="text-white/90 text-sm font-medium leading-relaxed">
                  まだ交流がありません<br />
                  ホーム画面からQRコードを読み取って<br />
                  新しい出会いを始めましょう！
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-center gap-1 mb-3">
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                  <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse delay-100" />
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse delay-200" />
                </div>
                <p className="text-white/90 text-sm font-medium leading-relaxed">
                  素晴らしい交流実績です！<br />
                  引き続き新しい出会いを楽しんでください
                </p>
              </div>
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
    </div>
  )
}