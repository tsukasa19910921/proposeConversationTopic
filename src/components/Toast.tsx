'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000
}: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // アニメーション完了後にクローズ
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible) return null

  const styles = {
    success: {
      bg: 'from-green-500 to-teal-500',
      border: 'border-green-400',
      icon: CheckCircle,
      iconColor: 'text-white',
      glow: 'shadow-green-500/50'
    },
    error: {
      bg: 'from-red-500 to-pink-500',
      border: 'border-red-400',
      icon: XCircle,
      iconColor: 'text-white',
      glow: 'shadow-red-500/50'
    },
    warning: {
      bg: 'from-yellow-400 to-orange-500',
      border: 'border-yellow-400',
      icon: AlertCircle,
      iconColor: 'text-white',
      glow: 'shadow-yellow-500/50'
    }
  }[type]

  const Icon = styles.icon

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-300 transform
                    ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className={`backdrop-blur-lg bg-white/90 rounded-2xl shadow-2xl overflow-hidden
                      border ${styles.border} max-w-sm
                      transform transition-all duration-300 hover:scale-105 ${styles.glow}`}>
        {/* グラデーションヘッダー */}
        <div className={`h-1.5 bg-gradient-to-r ${styles.bg}`}></div>

        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            {/* アイコン */}
            <div className={`p-2 rounded-full bg-gradient-to-br ${styles.bg} flex-shrink-0
                          shadow-lg transform transition-transform duration-300 hover:rotate-12`}>
              <Icon className={`w-5 h-5 ${styles.iconColor}`} />
            </div>

            {/* メッセージ */}
            <div className="flex-1 pt-1">
              <p className="text-gray-800 font-medium text-sm leading-relaxed">
                {message}
              </p>
            </div>

            {/* クローズボタン */}
            <button
              onClick={() => {
                setIsAnimating(false)
                setTimeout(onClose, 300)
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>

          {/* プログレスバー */}
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${styles.bg} rounded-full transition-all`}
              style={{
                animation: `shrink ${duration}ms linear`,
                transformOrigin: 'left'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}