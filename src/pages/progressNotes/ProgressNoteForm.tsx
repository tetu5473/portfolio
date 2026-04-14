/**
 * ProgressNoteForm.tsx — 支援経過追加・編集フォームコンポーネント
 * 音声入力（useVoiceInput）で経過内容をマイク入力できる
 */
import { useState } from 'react'
import type { ProgressNote, User } from '../../types'
import { saveProgressNote } from '../../utils/storage'
import { generateId } from '../../utils/idUtils'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import styles from '../Form.module.css'

interface Props {
  note: ProgressNote | null
  users: User[]
  onSaved: () => void
  onCancel: () => void
}

export default function ProgressNoteForm({ note, users, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    userId: note?.userId ?? (users[0]?.id ?? ''),
    date: note?.date ?? new Date().toISOString().slice(0, 10),
    author: note?.author ?? '',
    content: note?.content ?? '',
  })

  const voice = useVoiceInput({
    onResult: (text) => set('content', form.content ? form.content + ' ' + text : text),
  })

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      if (form) form.requestSubmit()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const saved: ProgressNote = {
      id: note?.id ?? generateId(),
      ...form,
      createdAt: note?.createdAt ?? new Date().toISOString(),
    }
    saveProgressNote(saved)
    onSaved()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>利用者 <span className={styles.required}>*</span></label>
          <select className={styles.select} value={form.userId} onChange={(e) => set('userId', e.target.value)} required>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>日付 <span className={styles.required}>*</span></label>
          <input className={styles.input} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>記録者 <span className={styles.required}>*</span></label>
          <input className={styles.input} value={form.author} onChange={(e) => set('author', e.target.value)} required placeholder="田中 美咲" />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>経過内容 <span className={styles.required}>*</span></label>
        <div className={styles.textareaWrap}>
          <textarea className={styles.textarea} value={form.content} onChange={(e) => set('content', e.target.value)} required rows={5} placeholder="実施したサービスの内容・利用者の状態等を記入してください" style={{ paddingBottom: 40 }} />
          <button type="button" className={`${styles.voiceBtn} ${voice.listening ? styles.voiceBtnActive : ''}`} onClick={voice.listening ? voice.stop : voice.start} title="音声入力">
            {voice.listening ? '⏹' : '🎤'}
          </button>
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>キャンセル</button>
        <button type="submit" className={styles.btnPrimary}>保存</button>
      </div>
    </form>
  )
}
