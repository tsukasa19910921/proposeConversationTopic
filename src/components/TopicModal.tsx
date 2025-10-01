'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Sparkles, X, Loader2 } from 'lucide-react'

interface TopicModalProps {
  isOpen: boolean
  message: string
  onClose: () => void
  isBusy?: boolean
  title?: string
  subtitle?: string
}

export default function TopicModal({
  isOpen,
  message,
  onClose,
  isBusy = false,
  title = '会話の話題',
  subtitle
}: TopicModalProps) {
  const [displayedMessage, setDisplayedMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // タイプライターエフェクト
  useEffect(() => {
    if (message && !isBusy) {
      setIsTyping(true)
      setDisplayedMessage('')
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex <= message.length) {
          setDisplayedMessage(message.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, 30)
      return () => clearInterval(interval)
    }
  }, [message, isBusy])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4
                  animate-fadeIn">
      <div className="relative max-w-md w-full animate-slideInUp">
        {/* モーダル本体 */}
        <div className="backdrop-blur-lg bg-white/95 rounded-3xl shadow-2xl overflow-hidden
                      transform transition-all duration-300 hover:scale-[1.02]">

          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-teal-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-md">
                  {isBusy ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <MessageCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{title}</h2>
                  {subtitle && (
                    <p className="text-white/80 text-sm">{subtitle}</p>
                  )}
                </div>
              </div>
              {!isBusy && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-6">
            {isBusy ? (
              // ローディング状態
              <div className="flex flex-col items-center py-8">
                {/* AI波紋エフェクト */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-ping">
                    <div className="w-20 h-20 bg-purple-400 rounded-full opacity-20"></div>
                  </div>
                  <div className="absolute inset-0 animate-ping animation-delay-200">
                    <div className="w-20 h-20 bg-pink-400 rounded-full opacity-20"></div>
                  </div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full
                                flex items-center justify-center shadow-lg">
                    <Sparkles className="w-10 h-10 text-white animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-700 font-medium animate-pulse mb-2">
                  AIが話題を探しています
                </p>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            ) : (
              // メッセージ表示（チャット風）
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-2">AI Assistant</p>
                    <div className="bg-gradient-to-r from-purple-50 to-teal-50 rounded-2xl rounded-tl-none p-4 shadow-inner">
                      <p className="text-gray-800 leading-relaxed">
                        {displayedMessage}
                        {isTyping && <span className="animate-pulse">▊</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}