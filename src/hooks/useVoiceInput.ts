/**
 * useVoiceInput — マイクからの音声入力をテキストに変換するカスタムフック
 * Web Speech API（SpeechRecognition）を使用する
 */
import { useState, useRef, useCallback } from 'react'

interface UseVoiceInputOptions {
  onResult: (text: string) => void
}

// Web Speech API はブラウザ間で実装が異なる。
// Chrome は window.webkitSpeechRecognition、標準仕様では window.SpeechRecognition。
// 両方を || で参照することで、どちらのブラウザでも動作するようにしている。
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  start(): void
  stop(): void
}

interface SpeechRecognitionResultEvent {
  results: { 0: { 0: { transcript: string } } }
}

export function useVoiceInput({ onResult }: UseVoiceInputOptions) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback(() => {
    if (!supported) {
      alert('お使いのブラウザは音声入力に対応していません。Chrome をお試しください。')
      return
    }
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionClass()
    recognition.lang = 'ja-JP'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [supported, onResult])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return { listening, supported, start, stop }
}
