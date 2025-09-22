'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          QRプロフィール×話題提示
        </h1>
        <p className="text-gray-600">
          QRコードを交換して、会話のきっかけを見つけよう！
        </p>
      </div>

      {!isLoggedIn ? (
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block w-full py-3 px-4 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/auth/signup"
            className="block w-full py-3 px-4 bg-green-500 text-white text-center rounded-lg hover:bg-green-600 transition-colors"
          >
            新規登録
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログイン済み</p>
          <Link
            href="/home"
            className="inline-block py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ホームに進む
          </Link>
        </div>
      )}
    </div>
  )
}