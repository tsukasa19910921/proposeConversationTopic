'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { RefreshCw, QrCode, Users, Trophy, Sparkles, TrendingUp } from 'lucide-react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useToast } from '@/hooks/useToast'
import { useApi } from '@/hooks/useApi'

interface MetricsData {
  scanOut: number
  scanIn: number
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData>({ scanOut: 0, scanIn: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { show } = useToast()
  const { json } = useApi()

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const data = await json<MetricsData>('/api/metrics/me')
      setMetrics(data)
    } catch (error: any) {
      if (error.status !== 401) {
        show('実績の取得に失敗しました', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
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
      <div className="max-w-md mx-auto p-4 pb-20">
        <div className="flex justify-between items-center mb-4 pt-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">実績</h1>
            <p className="text-white/80 text-xs sm:text-sm">あなたの交流記録</p>
          </div>
          <button
            onClick={fetchMetrics}
            className="p-2.5 backdrop-blur-lg bg-white/20 rounded-full
                     hover:bg-white/30 transition-all duration-300 transform hover:scale-110
                     shadow-lg group"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* 実績カード */}
        <div className="space-y-4">
          {/* 読み取り回数 */}
          <div className="backdrop-blur-lg bg-white/90 rounded-xl shadow-xl p-4
                        transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full shadow-md">
                    <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
                    読み取り回数
                  </h2>
                </div>
                <p className="text-xs text-gray-600 ml-10">
                  他の人のQRコードをスキャン
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
                  <AnimatedNumber value={metrics.scanOut} delay={200} />
                </div>
                <div className="text-xs text-gray-500 font-medium">回</div>
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
          <div className="backdrop-blur-lg bg-white/90 rounded-xl shadow-xl p-4
                        transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full shadow-md">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">
                    読み取られ回数
                  </h2>
                </div>
                <p className="text-xs text-gray-600 ml-10">
                  あなたのQRコードが読まれた数
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">
                  <AnimatedNumber value={metrics.scanIn} delay={400} />
                </div>
                <div className="text-xs text-gray-500 font-medium">回</div>
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
                        rounded-xl shadow-2xl p-6 text-white overflow-hidden
                        transform transition-all duration-300 hover:scale-[1.01]">
            {/* 背景の光エフェクト */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative text-center">
              <div className="inline-flex p-3 bg-white/20 rounded-full mb-3 backdrop-blur-md">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 animate-pulse" />
              </div>
              <h2 className="text-base sm:text-lg font-bold mb-2 drop-shadow-lg">総合実績</h2>
              <div className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg">
                <AnimatedNumber value={metrics.scanOut + metrics.scanIn} delay={600} />
              </div>
              <div className="text-xs sm:text-sm font-medium mb-3 opacity-90">
                総交流回数
              </div>

              {/* スパークルエフェクト */}
              <div className="flex justify-center gap-1 mb-2">
                <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse delay-100" />
                <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse delay-200" />
              </div>

              <div className="text-[10px] sm:text-xs font-medium opacity-80 leading-relaxed">
                QRコードを通じて<br />
                <span className="text-sm font-bold">{metrics.scanOut + metrics.scanIn}</span>回の素晴らしい出会いがありました！
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
      </div>
    </div>
  )
}