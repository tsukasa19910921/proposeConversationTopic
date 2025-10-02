/**
 * 共通ローディング画面コンポーネント
 */

interface LoadingScreenProps {
  /** 表示するラベル（デフォルト: 読み込み中...） */
  label?: string
}

export function LoadingScreen({ label = '読み込み中...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
        <p className="text-white font-medium">{label}</p>
      </div>
    </div>
  )
}

/**
 * オーバーレイ型ローディング（モーダルなど用）
 */
interface LoadingOverlayProps {
  /** 表示するラベル（デフォルト: 処理中...） */
  label?: string
}

export function LoadingOverlay({ label = '処理中...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-center">{label}</p>
      </div>
    </div>
  )
}