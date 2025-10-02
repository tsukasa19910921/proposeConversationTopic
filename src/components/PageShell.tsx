import { ReactNode } from 'react'

/**
 * ページ共通レイアウトシェル
 * グラデーション背景とカードレイアウトを提供
 */
interface PageShellProps {
  children: ReactNode
  /** 追加のクラス名 */
  className?: string
  /** カードの最大幅（デフォルト: max-w-md） */
  maxWidth?: string
  /** カードのパディング（デフォルト: p-8） */
  padding?: string
  /** ナビゲーション表示有無 */
  withNav?: boolean
}

export function PageShell({
  children,
  className = '',
  maxWidth = 'max-w-md',
  padding = 'p-8',
  withNav = false
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={`${maxWidth} w-full`}>
          <div className={`backdrop-blur-lg bg-white/90 rounded-3xl shadow-2xl ${padding} transform transition-all duration-300 hover:shadow-3xl ${className}`}>
            {children}
          </div>
        </div>
      </div>
      {withNav && <div className="pb-20" />}
    </div>
  )
}

/**
 * ナビゲーション付きページシェル
 * Navigation コンポーネントと組み合わせて使用
 */
interface PageWithNavProps {
  children: ReactNode
  /** ヘッダータイトル */
  title?: string
  /** サブタイトル */
  subtitle?: string
  /** ヘッダーアクション（ログアウトボタンなど） */
  headerAction?: ReactNode
}

export function PageWithNav({
  children,
  title,
  subtitle,
  headerAction
}: PageWithNavProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-teal-500 to-blue-600">
      <div className="max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー */}
        {title && (
          <div className="flex justify-between items-center mb-4 pt-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">{title}</h1>
              {subtitle && (
                <p className="text-white/80 text-xs sm:text-sm">{subtitle}</p>
              )}
            </div>
            {headerAction}
          </div>
        )}

        {/* コンテンツ */}
        {children}
      </div>
    </div>
  )
}