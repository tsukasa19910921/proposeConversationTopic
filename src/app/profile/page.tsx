'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Toast from '@/components/Toast'

const TOPICS = {
  sports: {
    label: 'スポーツ',
    icon: '⚽',
    options: ['野球', 'サッカー', '卓球', 'テニス', 'バスケットボール', 'バレーボール', 'ゴルフ', 'その他']
  },
  music: {
    label: '音楽',
    icon: '🎵',
    options: ['J-POP', 'K-POP', 'ロック', 'ジャズ', 'クラシック', 'アニソン', 'ボカロ', 'その他']
  },
  food: {
    label: '食事',
    icon: '🍕',
    options: ['和食', '洋食', '中華', 'イタリアン', 'ファストフード', 'お菓子作り', 'カフェ', 'その他']
  },
  movies: {
    label: '映画・ドラマ',
    icon: '🎬',
    options: ['邦画', '洋画', '韓国ドラマ', 'アニメ', 'ドキュメンタリー', 'コメディ', 'ホラー', 'その他']
  },
  games: {
    label: 'ゲーム',
    icon: '🎮',
    options: ['RPG', 'アクション', 'パズル', 'シミュレーション', 'FPS', 'モバイルゲーム', 'ボードゲーム', 'その他']
  },
  books: {
    label: '読書',
    icon: '📚',
    options: ['小説', '漫画', 'ライトノベル', 'ビジネス書', '自己啓発', '歴史', '科学', 'その他']
  }
}

interface ProfileData {
  [topicId: string]: {
    [option: string]: {
      selected: boolean
      freeText: string
    }
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({})
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

  const initializeProfileStructure = () => {
    const initialProfile: ProfileData = {}
    Object.keys(TOPICS).forEach(topicId => {
      initialProfile[topicId] = {}
      TOPICS[topicId as keyof typeof TOPICS].options.forEach(option => {
        initialProfile[topicId][option] = {
          selected: false,
          freeText: ''
        }
      })
    })
    return initialProfile
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile/me')

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        const initialProfile = initializeProfileStructure()

        if (data && Object.keys(data).length > 0) {
          Object.keys(data).forEach(topicId => {
            if (initialProfile[topicId] && data[topicId]) {
              Object.keys(data[topicId]).forEach(option => {
                if (initialProfile[topicId][option]) {
                  initialProfile[topicId][option] = {
                    selected: data[topicId][option]?.selected || false,
                    freeText: data[topicId][option]?.freeText || ''
                  }
                }
              })
            }
          })
        }

        setProfile(initialProfile)
      } else {
        setProfile(initializeProfileStructure())
      }
    } catch (error) {
      showToast('プロフィールの取得に失敗しました', 'error')
      setProfile(initializeProfileStructure())
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
      const newSet = new Set(prev)
      if (newSet.has(topicId)) {
        newSet.delete(topicId)
      } else {
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
      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      if (response.ok) {
        showToast('プロフィールを保存しました', 'success')
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
      <h1 className="text-xl font-bold text-gray-800 mb-6">プロフィール設定</h1>

      <div className="space-y-4">
        {Object.entries(TOPICS).map(([topicId, topic]) => {
          const isExpanded = expandedTopics.has(topicId)
          const hasSelections = hasSelectedOptions(topicId)

          return (
            <div key={topicId} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* トピックヘッダー（クリック可能） */}
              <button
                onClick={() => toggleTopic(topicId)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{topic.icon}</span>
                  <h2 className="text-lg font-semibold text-gray-800">{topic.label}</h2>
                  {hasSelections && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {hasSelections && (
                    <span className="text-xs text-blue-600 font-medium">
                      {Object.values(profile[topicId] || {}).filter(option => option.selected).length}件選択中
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
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

              {/* 選択肢（展開時のみ表示） */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-4">
                  {topic.options.map((option) => (
                    <div key={option} className="space-y-2">
                      {/* チェックボックス */}
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile[topicId]?.[option]?.selected || false}
                          onChange={() => handleOptionToggle(topicId, option)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>

                      {/* 自由入力欄（選択時のみ表示） */}
                      {profile[topicId]?.[option]?.selected && (
                        <div className="ml-7">
                          <textarea
                            value={profile[topicId][option].freeText}
                            onChange={(e) => handleFreeTextChange(topicId, option, e.target.value)}
                            placeholder={`${option}について詳しく教えてください...`}
                            className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-blue-50"
                            maxLength={100}
                          />
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {profile[topicId][option].freeText.length}/100文字
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 保存ボタン */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '保存中...' : '保存する'}
        </button>
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