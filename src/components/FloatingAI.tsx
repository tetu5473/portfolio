import { useState, useRef, useEffect } from 'react'
import type { ClaudeMessage } from '../utils/claudeApi'
import { askClaude } from '../utils/claudeApi'
import { getUsers, getProgressNotes, getCarePlans } from '../utils/storage'
import styles from './FloatingAI.module.css'

function buildContext(): string {
  const users = getUsers()
  const notes = getProgressNotes().slice(0, 20)
  const plans = getCarePlans().slice(0, 10)
  const userSummary = users.map((u) => `・${u.name}（${u.careLevel}、担当: ${u.staffName}）`).join('\n')
  const noteSummary = notes.map((n) => {
    const user = users.find((u) => u.id === n.userId)
    return `[${n.date}] ${user?.name ?? '不明'}: ${n.content}`
  }).join('\n')
  const planSummary = plans.map((p) => {
    const user = users.find((u) => u.id === p.userId)
    return `${user?.name ?? '不明'}: 長期目標「${p.longTermGoal}」短期目標「${p.shortTermGoal}」`
  }).join('\n')
  return `【登録利用者】\n${userSummary}\n\n【最近の支援経過】\n${noteSummary}\n\n【ケアプラン】\n${planSummary}`
}

export default function FloatingAI() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ClaudeMessage[]>([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const text = query.trim()
    if (!text || loading) return
    const context = buildContext()
    const userMessage: ClaudeMessage = {
      role: 'user',
      content: `以下はケア管理システムのデータです。このデータをもとに質問に答えてください。\n\n${context}\n\n---\n\n質問: ${text}`,
    }
    const newMessages: ClaudeMessage[] = [...messages, userMessage]
    setMessages(newMessages)
    setQuery('')
    setLoading(true)
    try {
      const reply = await askClaude(newMessages)
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました'
      setMessages([...newMessages, { role: 'assistant', content: `⚠️ ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
  }

  return (
    <>
      {/* フローティングボタン */}
      <button className={`${styles.fab} ${open ? styles.fabOpen : ''}`} onClick={() => setOpen(!open)}>
        {open ? '✕' : '🤖'}
      </button>

      {/* チャットパネル */}
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>🤖 AIアシスタント</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.welcome}>
                介護ケアに関する質問や文章作成をサポートします。
              </div>
            )}
            {messages
              .filter((m) => m.role === 'assistant' || (m.role === 'user' && !m.content.startsWith('以下はケア管理システム')))
              .map((m, i) => {
                const content = m.role === 'user'
                  ? m.content.replace(/^以下はケア管理システム.*?---\n\n質問: /s, '')
                  : m.content
                return (
                  <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.user : styles.assistant}`}>
                    <div className={styles.role}>{m.role === 'user' ? '👤' : '🤖'}</div>
                    <div className={styles.content}>{content}</div>
                  </div>
                )
              })}
            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.role}>🤖</div>
                <div className={styles.typing}><span/><span/><span/></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.inputArea}>
            <textarea
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力... (Ctrl+Enter で送信)"
              rows={2}
              disabled={loading}
            />
            <div className={styles.inputActions}>
              {messages.length > 0 && (
                <button className={styles.clearBtn} onClick={() => setMessages([])}>クリア</button>
              )}
              <button className={styles.sendBtn} onClick={handleSend} disabled={loading || !query.trim()}>送信</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
