'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Toast from '@/components/Toast'
import { TOPICS } from '@/lib/topics'
import { expandProfileForUI, packProfileFromUI } from '@/lib/profile-shape'
import type { UIProfile } from '@/lib/profile-shape'
import { CheckCircle, Sparkles, Save } from 'lucide-react'

interface ProfileData {
  [topicId: string]: {
    [option: string]: {
      selected: boolean
      freeText: string
    }
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UIProfile>({})
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])


  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile/me')

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setProfile(expandProfileForUI(data)) // 現行UIにだけ反映
      } else {
        setProfile(expandProfileForUI({})) // 空をUI既定に
      }
    } catch (error) {
      showToast('プロフィールの取得に失敗しました', 'error')
      setProfile(expandProfileForUI({}))
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

  const handleOptionToggle = (topicId: string, option: string) => {
    setProfile(prev => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        [option]: {
          ...prev[topicId][option],
          selected: !prev[topicId][option].selected
        }
      }
    }))
  }

  const handleFreeTextChange = (topicId: string, option: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        [option]: {
          ...prev[topicId][option],
          freeText: value
        }
      }
    }))
  }

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set<string>()
      // 現在開いているものをクリックした場合は閉じる
      // そうでない場合は、クリックしたものだけを開く
      if (!prev.has(topicId)) {
        newSet.add(topicId)
      }
      return newSet
    })
  }

  const hasSelectedOptions = (topicId: string) => {
    return Object.values(profile[topicId] || {}).some(option => option.selected)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const packed = packProfileFromUI(profile) // 最小構造で送る
      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packed),
      })

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      if (response.ok) {
        showToast('プロフィールを保存しました', 'success')
        // 保存成功後、少し待ってからホーム画面へ遷移
        setTimeout(() => {
          router.push('/home')
        }, 1000)
      } else {
        showToast('保存に失敗しました', 'error')
      }
    } catch (error) {
      showToast('ネットワークエラーが発生しました', 'error')
    } finally {
      setIsSaving(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600">
      <div className="max-w-md mx-auto p-4 pb-24">
        <div className="text-center mb-6 pt-4">
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">プロフィール設定</h1>
          <p className="text-white/80 text-sm">興味のあることをタップしてね！</p>
        </div>

      {/* ガイダンス */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              まずプロフィールを設定してください。設定後、ホームから相手のQRを読み取るか、自分のQRを表示できます。
            </p>
          </div>
        </div>
      </div> */}

        <div className="space-y-4">
          {Object.entries(TOPICS).map(([topicId, topic]) => {
            const isExpanded = expandedTopics.has(topicId)
            const hasSelections = hasSelectedOptions(topicId)

            return (
              <div key={topicId}
                   className="backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl overflow-hidden
                            transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                {/* トピックヘッダー（クリック可能） */}
                <button
                  onClick={() => toggleTopic(topicId)}
                  className="w-full p-5 flex items-center justify-between
                           bg-gradient-to-r from-white/50 to-white/30
                           hover:from-white/60 hover:to-white/40 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-3xl transform transition-transform duration-300 ${isExpanded ? 'rotate-12 scale-110' : ''}`}>
                      {topic.icon}
                    </div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
                      {topic.label}
                    </h2>
                    {hasSelections && (
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasSelections && (
                      <span className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-teal-500 rounded-full">
                        {Object.values(profile[topicId] || {}).filter(option => option.selected).length}
                      </span>
                    )}
                    <svg
                      className={`w-5 h-5 text-purple-500 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* 選択肢（展開時のみ表示） - タグスタイル */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-white/40">
                    {/* タグ選択エリア */}
                    <div className="flex flex-wrap gap-2">
                      {topic.options.map((option) => {
                        const isSelected = profile[topicId]?.[option]?.selected || false
                        return (
                          <button
                            key={option}
                            onClick={() => handleOptionToggle(topicId, option)}
                            className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform
                              ${isSelected
                                ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white scale-105 shadow-lg'
                                : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:scale-105 shadow-md'
                              }`}
                          >
                            <span className="flex items-center gap-1">
                              {isSelected && <CheckCircle className="w-3 h-3" />}
                              {option}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* 選択されたタグの詳細入力 */}
                    <div className="space-y-3">
                      {topic.options.filter(option => profile[topicId]?.[option]?.selected).map((option) => (
                        <div key={option} className="backdrop-blur-md bg-white/50 rounded-xl p-3 shadow-inner">
                          <label className="text-sm font-medium text-purple-700 mb-1 block">
                            {option}の詳細
                          </label>
                          <textarea
                            value={profile[topicId][option].freeText}
                            onChange={(e) => handleFreeTextChange(topicId, option, e.target.value)}
                            placeholder={`${option}について詳しく教えてください...`}
                            className="w-full h-20 px-3 py-2 text-sm
                                     backdrop-blur-lg bg-white/60 border border-white/50
                                     rounded-lg shadow-inner
                                     focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/80
                                     transition-all duration-300 resize-none"
                            maxLength={100}
                          />
                          <p className="text-xs text-purple-600 mt-1 text-right font-medium">
                            {profile[topicId][option].freeText.length}/100
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 保存ボタン */}
        <div className="mt-8 relative">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-lg
                     transform transition-all duration-300
                     ${isSaving
                       ? 'bg-gray-400 cursor-wait scale-95'
                       : 'bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500 hover:scale-105 hover:shadow-2xl active:scale-95'
                     }
                     shadow-xl backdrop-blur-md relative overflow-hidden group`}
          >
            {/* キラキラエフェクト */}
            {!isSaving && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            )}

            <span className="relative flex items-center justify-center gap-2">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  プロフィールを保存
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </>
              )}
            </span>
          </button>

          {/* 保存成功時のパーティクルエフェクト（オプション） */}
          {toast.type === 'success' && toast.isVisible && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: '50%',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1s',
                  }}
                ></div>
              ))}
            </div>
          )}
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