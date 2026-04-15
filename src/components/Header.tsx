import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WeatherData } from '../types'
import { fetchWeather, getWeatherIconUrl } from '../utils/weatherApi'
import { logout } from '../utils/auth'
import styles from './Header.module.css'

/**
 * アプリ共通ヘッダーコンポーネント
 * - ページタイトル・現在日時・天気・ログアウトボタンを表示する
 */

/** Props の型定義 */
interface Props {
  /** ヘッダーに表示するページタイトル */
  title: string
}

export default function Header({ title }: Props) {
  // 天気情報（取得前は null）
  const [weather, setWeather] = useState<WeatherData | null>(null)
  // 現在日時（1秒ごとに更新）
  const [now, setNow] = useState(new Date())
  const navigate = useNavigate()

  /** ログアウト処理: セッションを破棄してログイン画面へ遷移 */
  function handleLogout() {
    logout()
    navigate('/login')
  }

  // 初回マウント時に小樽市の天気を取得
  useEffect(() => {
    fetchWeather('Otaru').then(setWeather)
  }, [])

  // 1秒ごとに現在時刻を更新するタイマーを設定
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer) // アンマウント時にタイマーを解除
  }, [])

  const dateStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const timeStr = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>
        <span className={styles.date}>{dateStr}</span>
        <span className={styles.time}>{timeStr}</span>
        {weather && (
          <div className={styles.weather}>
            <span className={styles.weatherCity}>小樽市</span>
            <img
              src={getWeatherIconUrl(weather.icon)}
              alt={weather.description}
              className={styles.weatherIcon}
            />
            <span className={styles.weatherTemp}>{weather.temp}°C</span>
            <span className={styles.weatherDesc}>{weather.description}</span>
          </div>
        )}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    </header>
  )
}
