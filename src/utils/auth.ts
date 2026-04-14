/**
 * auth.ts — 認証ユーティリティ（デモ用）
 *
 * ⚠️ これはポートフォリオ用のデモ実装である。
 * ID・パスワードがソースコードに直書きされているため、本番環境では絶対に使用しないこと。
 * 本番では認証情報を .env に移し、サーバーサイドで検証する必要がある。
 */
const AUTH_KEY = 'care_auth'
const DEFAULT_ID = 'admin'
const DEFAULT_PASSWORD = 'password'

export function login(id: string, password: string): boolean {
  if (id === DEFAULT_ID && password === DEFAULT_PASSWORD) {
    localStorage.setItem(AUTH_KEY, 'true')
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true'
}
