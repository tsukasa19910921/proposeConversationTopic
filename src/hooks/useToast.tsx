'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Toast from '@/components/Toast'

/**
 * Toast通知の種類
 */
export type ToastType = 'success' | 'error' | 'warning'

/**
 * Toast状態
 */
type ToastState = {
  message: string
  type: ToastType
  visible: boolean
}

/**
 * ToastContextの型定義
 */
type ToastContextType = {
  state: ToastState
  show: (message: string, type: ToastType) => void
  hide: () => void
}

/**
 * ToastContext
 */
const ToastContext = createContext<ToastContextType | null>(null)

/**
 * ToastProvider - アプリ全体でToast機能を提供
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({
    message: '',
    type: 'success',
    visible: false
  })

  const show = useCallback((message: string, type: ToastType) => {
    setState({ message, type, visible: true })
  }, [])

  const hide = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }))
  }, [])

  return (
    <ToastContext.Provider value={{ state, show, hide }}>
      {children}
    </ToastContext.Provider>
  )
}

/**
 * ToastPortal - Toast通知を表示するためのポータル
 */
export function ToastPortal() {
  const context = useContext(ToastContext)

  if (!context) {
    return null
  }

  return (
    <Toast
      message={context.state.message}
      type={context.state.type}
      isVisible={context.state.visible}
      onClose={context.hide}
    />
  )
}

/**
 * useToast - Toast機能を使用するためのフック
 */
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return {
    show: context.show,
    hide: context.hide,
    state: context.state
  }
}