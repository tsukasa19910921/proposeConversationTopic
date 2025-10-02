'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * API呼び出しフック
 * 401エラーの自動ハンドリングとJSON取得を統一化
 */
export function useApi() {
  const router = useRouter()

  /**
   * JSONレスポンスを期待するAPIコール
   */
  const json = useCallback(async <T = any>(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<T> => {
    try {
      const response = await fetch(input, {
        credentials: 'include', // Cookie認証を含める
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
        ...init,
      })

      // 401エラー（未認証）の場合はログイン画面へリダイレクト
      if (response.status === 401) {
        router.push('/auth/login')
        throw new ApiError(401, 'Unauthorized')
      }

      // その他のエラーステータス
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = null
        }

        throw new ApiError(
          response.status,
          errorData?.message || `HTTP ${response.status}`,
          errorData
        )
      }

      // 成功レスポンス
      return await response.json() as T
    } catch (error) {
      // fetch自体のエラー（ネットワークエラーなど）
      if (error instanceof ApiError) {
        throw error
      }

      throw new Error('Network error occurred')
    }
  }, [router])

  /**
   * テキストレスポンスを期待するAPIコール
   */
  const text = useCallback(async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<string> => {
    try {
      const response = await fetch(input, {
        credentials: 'include',
        ...init,
      })

      // 401エラーの場合はログイン画面へリダイレクト
      if (response.status === 401) {
        router.push('/auth/login')
        throw new ApiError(401, 'Unauthorized')
      }

      if (!response.ok) {
        throw new ApiError(response.status, `HTTP ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new Error('Network error occurred')
    }
  }, [router])

  /**
   * レスポンスボディを期待しないAPIコール（DELETEなど）
   */
  const execute = useCallback(async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<void> => {
    try {
      const response = await fetch(input, {
        credentials: 'include',
        ...init,
      })

      // 401エラーの場合はログイン画面へリダイレクト
      if (response.status === 401) {
        router.push('/auth/login')
        throw new ApiError(401, 'Unauthorized')
      }

      if (!response.ok) {
        throw new ApiError(response.status, `HTTP ${response.status}`)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new Error('Network error occurred')
    }
  }, [router])

  return { json, text, execute }
}