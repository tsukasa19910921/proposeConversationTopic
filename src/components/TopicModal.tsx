'use client'

interface TopicModalProps {
  isOpen: boolean
  message: string
  onClose: () => void
}

export default function TopicModal({ isOpen, message, onClose }: TopicModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">会話の話題</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}