/**
 * MeetingForm.tsx — 担当者会議追加・編集フォームコンポーネント
 * 参加者・検討内容・結論・今後の課題の各フィールドに音声入力が使える
 */
import { useState } from 'react'
import type { Meeting, User } from '../../types'
import { saveMeeting } from '../../utils/storage'
import { generateId } from '../../utils/idUtils'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import styles from '../Form.module.css'

interface Props {
  meeting: Meeting | null
  users: User[]
  onSaved: () => void
  onCancel: () => void
}

export default function MeetingForm({ meeting, users, onSaved, onCancel }: Props) {
  // 編集時は既存データを初期値にセット。日時は datetime-local 入力用に "YYYY-MM-DDTHH:mm" 形式にする
  const [form, setForm] = useState({
    userId: meeting?.userId ?? (users[0]?.id ?? ''),
    // slice(0, 16) で秒以下を除いた "YYYY-MM-DDTHH:mm" 形式の文字列を取得する
    date: meeting?.date ?? new Date().toISOString().slice(0, 16),
    location: meeting?.location ?? '',
    participants: meeting?.participants ?? '',
    agenda: meeting?.agenda ?? '',
    discussion: meeting?.discussion ?? '',
    conclusion: meeting?.conclusion ?? '',
    futureTasks: meeting?.futureTasks ?? '',
  })

  // set: 単一フィールドだけを更新するユーティリティ関数（スプレッドで既存値を保持する）
  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // 各テキストエリアに独立した音声入力フックを設定する
  // 既存テキストがある場合はスペースを挟んで追記し、ない場合はそのままセットする
  const voiceParticipants = useVoiceInput({ onResult: (t) => set('participants', form.participants ? form.participants + ' ' + t : t) })
  const voiceDiscussion = useVoiceInput({ onResult: (t) => set('discussion', form.discussion ? form.discussion + ' ' + t : t) })
  const voiceConclusion = useVoiceInput({ onResult: (t) => set('conclusion', form.conclusion ? form.conclusion + ' ' + t : t) })
  const voiceFutureTasks = useVoiceInput({ onResult: (t) => set('futureTasks', form.futureTasks ? form.futureTasks + ' ' + t : t) })

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
    const saved: Meeting = {
      // 編集時は既存 id を維持し、新規追加時は一意な id を生成する
      id: meeting?.id ?? generateId(),
      ...form,
      // createdAt は初回作成時のみ設定し、編集時は変更しない
      createdAt: meeting?.createdAt ?? new Date().toISOString(),
    }
    saveMeeting(saved)
    onSaved()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      {/* grid2: 利用者・日時・場所を横並びにまとめるグリッドレイアウト */}
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>利用者 <span className={styles.required}>*</span></label>
          <select className={styles.select} value={form.userId} onChange={(e) => set('userId', e.target.value)} required>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>日時 <span className={styles.required}>*</span></label>
          {/* datetime-local: 日付と時刻を一つの入力フィールドで受け付ける */}
          <input className={styles.input} type="datetime-local" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>場所 <span className={styles.required}>*</span></label>
          <input className={styles.input} value={form.location} onChange={(e) => set('location', e.target.value)} required placeholder="利用者宅 / デイサービス 等" />
        </div>
      </div>
      {/* 参加者: 音声入力で複数人の名前をスムーズに入力できる */}
      <div className={styles.field}>
        <label className={styles.label}>参加者 <span className={styles.required}>*</span></label>
        <div className={styles.textareaWrap}>
          <textarea className={styles.textarea} value={form.participants} onChange={(e) => set('participants', e.target.value)} required rows={2} placeholder="利用者名、家族名（続柄）、担当CM、各サービス担当者名" style={{ paddingBottom: 40 }} />
          <button type="button" className={`${styles.voiceBtn} ${voiceParticipants.listening ? styles.voiceBtnActive : ''}`} onClick={voiceParticipants.listening ? voiceParticipants.stop : voiceParticipants.start} title="音声入力">{voiceParticipants.listening ? '⏹' : '🎤'}</button>
        </div>
      </div>
      {/* 議題: 音声入力なし（短い入力が多いため） */}
      <div className={styles.field}>
        <label className={styles.label}>議題</label>
        <textarea className={styles.textarea} value={form.agenda} onChange={(e) => set('agenda', e.target.value)} rows={2} placeholder="会議の主な議題を記入" />
      </div>
      {/* 検討した内容: 会議で協議された詳細を音声入力で記録できる */}
      <div className={styles.field}>
        <label className={styles.label}>検討した内容</label>
        <div className={styles.textareaWrap}>
          <textarea className={styles.textarea} value={form.discussion} onChange={(e) => set('discussion', e.target.value)} rows={3} placeholder="会議で検討・協議した内容を記入" style={{ paddingBottom: 40 }} />
          <button type="button" className={`${styles.voiceBtn} ${voiceDiscussion.listening ? styles.voiceBtnActive : ''}`} onClick={voiceDiscussion.listening ? voiceDiscussion.stop : voiceDiscussion.start} title="音声入力">{voiceDiscussion.listening ? '⏹' : '🎤'}</button>
        </div>
      </div>
      {/* 結論: 会議で決定した方針を音声入力で記録できる */}
      <div className={styles.field}>
        <label className={styles.label}>結論</label>
        <div className={styles.textareaWrap}>
          <textarea className={styles.textarea} value={form.conclusion} onChange={(e) => set('conclusion', e.target.value)} rows={2} placeholder="会議で決定した結論・方針を記入" style={{ paddingBottom: 40 }} />
          <button type="button" className={`${styles.voiceBtn} ${voiceConclusion.listening ? styles.voiceBtnActive : ''}`} onClick={voiceConclusion.listening ? voiceConclusion.stop : voiceConclusion.start} title="音声入力">{voiceConclusion.listening ? '⏹' : '🎤'}</button>
        </div>
      </div>
      {/* 今後の課題: 次回アクションや継続検討事項を音声入力で記録できる */}
      <div className={styles.field}>
        <label className={styles.label}>今後の課題</label>
        <div className={styles.textareaWrap}>
          <textarea className={styles.textarea} value={form.futureTasks} onChange={(e) => set('futureTasks', e.target.value)} rows={2} placeholder="今後対応が必要な課題を記入" style={{ paddingBottom: 40 }} />
          <button type="button" className={`${styles.voiceBtn} ${voiceFutureTasks.listening ? styles.voiceBtnActive : ''}`} onClick={voiceFutureTasks.listening ? voiceFutureTasks.stop : voiceFutureTasks.start} title="音声入力">{voiceFutureTasks.listening ? '⏹' : '🎤'}</button>
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>キャンセル</button>
        <button type="submit" className={styles.btnPrimary}>保存</button>
      </div>
    </form>
  )
}
