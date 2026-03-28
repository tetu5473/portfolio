import { useEffect, useState } from 'react'
import type { WeatherData } from '../types'
import { fetchWeather, getWeatherIconUrl } from '../utils/weatherApi'
import styles from './Header.module.css'

interface Props {
  title: string
}

export default function Header({ title }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    fetchWeather('Otaru').then(setWeather)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
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
      </div>
    </header>
  )
}
