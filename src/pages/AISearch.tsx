import { useState } from 'react'
import type { ClaudeMessage } from '../utils/claudeApi'
import { askClaude } from '../utils/claudeApi'
import { buildContext } from '../utils/aiContext'
import styles from './AISearch.module.css'

const SUGGESTIONS = [
  '山田 花子さんの最近の支援経過を要約してください',
  '転倒リスクが高い利用者向けのケアプランの文言例を生成してください',
  '認知症の方への支援経過の書き方のポイントを教えてください',
  '担当者会議の議事録の書き方テンプレートを作成してください',
]

export default function AISearch() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ClaudeMessage[]>([])
  const [loading, setLoading] = useState(false)

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
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend()
    }
  }

  function handleSuggestion(text: string) {
    setQuery(text)
  }

  function clearChat() {
    setMessages([])
  }

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.chatArea}>
          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <div className={styles.welcomeIcon}>🤖</div>
                <div className={styles.welcomeTitle}>AI介護ケアアシスタント</div>
                <div className={styles.welcomeDesc}>
                  登録されているケア記録・ケアプランを参照して回答します。
                  <br />
                  ケア記録の検索・要約・文言生成などをお手伝いします。
                </div>
              </div>
            )}
            {messages
              .filter((m) => m.role === 'assistant' || (m.role === 'user' && !m.content.startsWith('以下はケア管理システム')))
              .map((m, i) => {
                const displayContent = m.role === 'user'
                  ? m.content.replace(/^以下はケア管理システム.*?---\n\n質問: /s, '')
                  : m.content
                return (
                  <div key={i} className={`${styles.message} ${styles[m.role]}`}>
                    <div className={styles.messageRole}>
                      {m.role === 'user' ? '👤 あなた' : '🤖 AI'}
                    </div>
                    <div className={styles.messageContent}>{displayContent}</div>
                  </div>
                )
              })}
            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.messageRole}>🤖 AI</div>
                <div className={styles.typing}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.inputArea}>
            <textarea
              className={styles.queryInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力... (Ctrl+Enter で送信)"
              rows={3}
              disabled={loading}
            />
            <div className={styles.inputActions}>
              {messages.length > 0 && (
                <button className={styles.btnClear} onClick={clearChat} disabled={loading}>
                  クリア
                </button>
              )}
              <button className={styles.btnSend} onClick={handleSend} disabled={loading || !query.trim()}>
                送信
              </button>
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <h3 className={styles.sideTitle}>よく使う質問</h3>
          <div className={styles.suggestions}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className={styles.suggestionBtn} onClick={() => handleSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
