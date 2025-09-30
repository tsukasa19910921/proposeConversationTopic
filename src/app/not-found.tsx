export default function NotFound() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-gray-800">ページが見つかりません</h1>
        <p className="text-gray-600 mt-2">
          URLが間違っているか、ページが移動・削除された可能性があります。
        </p>
      </div>

      <div className="space-y-3">
        <a
          href="/auth/login"
          className="block w-full text-center py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          ログイン
        </a>
        <a
          href="/auth/signup"
          className="block w-full text-center py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          新規登録
        </a>
        <a
          href="/"
          className="block w-full text-center py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ホームへ
        </a>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700 text-center">
          💡 QRコードを読み取った場合は、ログイン後に再度お試しください
        </p>
      </div>
    </div>
  )
}