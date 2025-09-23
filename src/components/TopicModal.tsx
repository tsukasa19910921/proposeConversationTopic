'use client'

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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">
            {isBusy ? '🔍' : '💬'}
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {title}
          </h2>

          {subtitle && (
            <p className="text-gray-500 text-sm mb-4">{subtitle}</p>
          )}

          {isBusy ? (
            <div className="flex flex-col items-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4" />
              <p className="text-gray-700 animate-pulse">
                話題を探しています...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                少々お待ちください
              </p>
            </div>
          ) : (
            <p className="text-gray-700 mb-6 leading-relaxed">{message}</p>
          )}

          <button
            onClick={onClose}
            disabled={isBusy}
            className={`w-full py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all
              ${isBusy
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            {isBusy ? '生成中...' : '閉じる'}
          </button>
        </div>
      </div>
    </div>
  )
}