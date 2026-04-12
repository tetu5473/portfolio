import { useState, useEffect, useRef, useCallback } from 'react'
import { askClaude } from '../utils/claudeApi'
import styles from './TextImprove.module.css'

interface Position { x: number; y: number }

export default function TextImprove() {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const [targetEl, setTargetEl] = useState<HTMLTextAreaElement | null>(null)
  const [selStart, setSelStart] = useState(0)
  const [selEnd, setSelEnd] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const el = e.target as HTMLElement
    if (el.tagName !== 'TEXTAREA') return

    // Small delay to allow selection to finalize
    setTimeout(() => {
      const textarea = el as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value.substring(start, end).trim()

      if (text.length < 5) {
        setVisible(false)
        return
      }

      const rect = textarea.getBoundingClientRect()
      setSelectedText(text)
      setTargetEl(textarea)
      setSelStart(start)
      setSelEnd(end)
      setPos({
        x: Math.min(e.clientX + window.scrollX, window.innerWidth - 220),
        y: e.clientY + window.scrollY - 48,
      })
      setVisible(true)
    }, 50)
  }, [])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (panelRef.current?.contains(e.target as Node)) return
    setVisible(false)
  }, [])

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [handleMouseUp, handleMouseDown])

  async function handleImprove() {
    if (!targetEl || loading) return
    setLoading(true)
    try {
      const reply = await askClaude([{
        role: 'user',
        content: `介護ケア記録の文章として、以下のテキストをより明確・丁寧に改善してください。改善後のテキストのみを返してください（説明は不要）。\n\n元のテキスト:\n${selectedText}`,
      }])
      // Replace selected text in textarea
      const before = targetEl.value.substring(0, selStart)
      const after = targetEl.value.substring(selEnd)
      const newValue = before + reply + after
      // Trigger React's synthetic event system
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
      nativeInputValueSetter?.call(targetEl, newValue)
      targetEl.dispatchEvent(new Event('input', { bubbles: true }))
      setVisible(false)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      style={{ left: pos.x, top: pos.y }}
    >
      <button className={styles.btn} onClick={handleImprove} disabled={loading}>
        {loading ? '...' : '✨ AI改善'}
      </button>
      <button className={styles.dismiss} onClick={() => setVisible(false)}>✕</button>
    </div>
  )
}
