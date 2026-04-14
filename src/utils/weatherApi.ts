/**
 * weatherApi.ts — OpenWeatherMap API を使った天気取得ユーティリティ
 * VITE_WEATHER_API_KEY が設定されていない場合はモックデータを返す
 * API エラー時もモックデータにフォールバックするため、APIキーなしでも動作する
 */
import type { WeatherData } from '../types'

const MOCK_DATA: WeatherData = {
  city: '東京',
  temp: 18,
  description: '晴れ',
  icon: '01d',
  humidity: 55,
}

export async function fetchWeather(city = 'Tokyo'): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY as string | undefined
  if (!apiKey) {
    return MOCK_DATA
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ja`
    )
    if (!res.ok) {
      console.warn('OpenWeatherMap API error, falling back to mock data')
      return MOCK_DATA
    }
    const data = await res.json()
    return {
      city: data.name,
      temp: Math.round(data.main.temp),
      description: data.weather[0]?.description ?? '',
      icon: data.weather[0]?.icon ?? '01d',
      humidity: data.main.humidity,
    }
  } catch (err) {
    console.warn('Failed to fetch weather:', err)
    return MOCK_DATA
  }
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}
