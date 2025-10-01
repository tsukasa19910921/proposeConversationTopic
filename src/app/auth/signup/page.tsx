'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, User, Lock, CheckCircle, ArrowLeft } from 'lucide-react'

function SignupForm() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Added for better cookie handling
        body: JSON.stringify({ userId, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Use window.location for full page reload to ensure cookies are sent
        window.location.assign('/profile')
      } else {
        setError(data.error === 'user_exists' ? 'このユーザーIDは既に使用されています' : '新規登録に失敗しました')
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-4">
        {/* 戻るボタン */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">戻る</span>
        </Link>

        {/* メインカード */}
        <div className="backdrop-blur-lg bg-white/90 rounded-3xl shadow-2xl p-8
                      transform transition-all duration-300 hover:scale-[1.02]">

          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-pink-500 to-teal-500 rounded-full mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-teal-500 bg-clip-text text-transparent mb-2">
              新規登録
            </h1>
            <p className="text-gray-600 text-sm">新しいアカウントを作成してください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ユーザーID入力 */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                ユーザーID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 backdrop-blur-lg bg-white/60 border border-white/50
                           rounded-xl shadow-inner
                           focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/80
                           transition-all duration-300"
                  placeholder="your_id"
                  required
                  disabled={isLoading}
                  minLength={3}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">3文字以上で入力してください</p>
            </div>

            {/* パスワード入力 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 backdrop-blur-lg bg-white/60 border border-white/50
                           rounded-xl shadow-inner
                           focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/80
                           transition-all duration-300"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">6文字以上で入力してください</p>
            </div>

            {/* パスワード確認 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード確認
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 backdrop-blur-lg bg-white/60 border border-white/50
                           rounded-xl shadow-inner
                           focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/80
                           transition-all duration-300"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="backdrop-blur-lg bg-red-500/10 border border-red-200 text-red-700 text-sm text-center p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-lg
                       transform transition-all duration-300
                       ${isLoading
                         ? 'bg-gray-400 cursor-wait scale-95'
                         : 'bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500 hover:scale-105 hover:shadow-2xl active:scale-95'
                       }
                       shadow-xl backdrop-blur-md relative overflow-hidden group`}
            >
              {!isLoading && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                                -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              )}
              <span className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    登録中...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    新規登録
                  </>
                )}
              </span>
            </button>
          </form>

          {/* フッター */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              既にアカウントをお持ちの場合
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 mt-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              ログインはこちら
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-medium">読み込み中...</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}