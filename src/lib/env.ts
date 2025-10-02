/**
 * 環境変数の一元管理
 * 起動時に必須環境変数を検証し、型安全なアクセスを提供
 */

function must(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, defaultValue: string = ""): string {
  return process.env[name] ?? defaultValue;
}

export const env = {
  // 実行環境
  NODE_ENV: process.env.NODE_ENV ?? "development",

  // データベース（必須）
  DATABASE_URL: must("DATABASE_URL"),

  // セッション管理（必須）
  SESSION_SECRET: must("SESSION_SECRET"),
  SESSION_MAX_AGE_SECONDS: Number(process.env.SESSION_MAX_AGE_SECONDS ?? 86400),

  // AI（オプション：開発時は空でも動作）
  GOOGLE_GEMINI_API_KEY: optional("GOOGLE_GEMINI_API_KEY"),

  // アプリケーション設定（必須）
  APP_BASE_URL: must("APP_BASE_URL"),

  // Google Analytics（オプション）
  NEXT_PUBLIC_GA_ID: optional("NEXT_PUBLIC_GA_ID"),
} as const;

// 型エクスポート
export type Env = typeof env;