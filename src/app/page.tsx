'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QrCode, UserPlus, LogIn, Sparkles, MessageCircle, Users } from 'lucide-react'

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-4">
        {/* メインカード */}
        <div className="backdrop-blur-lg bg-white/90 rounded-3xl shadow-2xl p-8
                      transform transition-all duration-300 hover:scale-[1.02]">

          {/* ロゴ・タイトル部分 */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full mb-4 shadow-lg">
              <QrCode className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent mb-3">
              Qtto.
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              QRコードでキュットつながる<br />
              AIが話題を提案してくれる交流アプリ
            </p>
          </div>

          {/* 特徴 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-xl mb-2 mx-auto w-fit">
                <QrCode className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">簡単QR交換</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-pink-100 rounded-xl mb-2 mx-auto w-fit">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <p className="text-xs text-gray-600">AI話題提案</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-teal-100 rounded-xl mb-2 mx-auto w-fit">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <p className="text-xs text-gray-600">新しい出会い</p>
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="space-y-3">
              {/* ログインボタン */}
              <Link
                href="/auth/login"
                className="block w-full py-4 px-6 rounded-2xl font-bold text-white text-lg
                         bg-gradient-to-r from-purple-500 via-pink-500 to-teal-500
                         transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                         active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                                -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                <span className="relative flex items-center justify-center gap-3">
                  <LogIn className="w-5 h-5" />
                  ログイン
                </span>
              </Link>

              {/* 新規登録ボタン */}
              <Link
                href="/auth/signup"
                className="block w-full py-4 px-6 rounded-2xl font-bold text-gray-700 text-lg
                         backdrop-blur-lg bg-white/60 border-2 border-white/50
                         transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white/80
                         active:scale-95"
              >
                <span className="flex items-center justify-center gap-3">
                  <UserPlus className="w-5 h-5" />
                  新規登録
                </span>
              </Link>

              <p className="text-center text-xs text-gray-500 mt-4">
                アカウントを作成して始めましょう
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex p-3 bg-green-100 rounded-full mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">ログイン済みです</p>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 py-3 px-6
                         bg-gradient-to-r from-purple-500 to-teal-500 text-white
                         rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-lg"
              >
                ホームに進む
                <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* フッター */}
        <p className="text-center text-white/60 text-xs mt-6">
          © 2025 Qtto. - Powered by AI
        </p>
      </div>
    </div>
  )
}