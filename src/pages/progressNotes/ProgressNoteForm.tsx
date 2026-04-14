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
  // 編集時は既存データを初期値にセット。日付は今日の日付をデフォルトにする
  const [form, setForm] = useState({
    userId: note?.userId ?? (users[0]?.id ?? ''),
    // toISOString().slice(0, 10) で "YYYY-MM-DD" 形式の文字列を取得する
    date: note?.date ?? new Date().toISOString().slice(0, 10),
    author: note?.author ?? '',
    content: note?.content ?? '',
  })

  // voice: 音声認識の開始・停止と認識結果の取得を管理するカスタムフック
  // 既存テキストがある場合はスペースを挟んで追記し、ない場合はそのままセットする
  const voice = useVoiceInput({
    onResult: (text) => set('content', form.content ? form.content + ' ' + text : text),
  })

  // set: 単一フィールドだけを更新するユーティリティ関数（スプレッドで既存値を保持する）
  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Cmd+Enter（Mac）または Ctrl+Enter（Windows）でフォームを送信できるようにする
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      // closest('form') でイベント発生元の最も近い form 要素を取得して送信する
      const form = e.currentTarget.closest('form')
      if (form) form.requestSubmit()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const saved: ProgressNote = {
      // 編集時は既存 id を維持し、新規追加時は一意な id を生成する
      id: note?.id ?? generateId(),
      ...form,
      // createdAt は初回作成時のみ設定し、編集時は変更しない
      createdAt: note?.createdAt ?? new Date().toISOString(),
    }
    saveProgressNote(saved)
    onSaved()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      {/* grid2: 利用者・日付・記録者を横並びにまとめるグリッドレイアウト */}
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
        {/* textareaWrap: テキストエリアの右下にマイクボタンを重ねて表示するための position: relative コンテナ */}
        <div className={styles.textareaWrap}>
          <textarea className={styles.textarea} value={form.content} onChange={(e) => set('content', e.target.value)} required rows={5} placeholder="実施したサービスの内容・利用者の状態等を記入してください" style={{ paddingBottom: 40 }} />
          {/* 音声入力中は赤いパルスアニメーション（voiceBtnActive）を表示し、停止ボタンに切り替える */}
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
