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
