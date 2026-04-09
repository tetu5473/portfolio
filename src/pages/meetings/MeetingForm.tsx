import { useState } from 'react'
import type { Meeting, User } from '../../types'
import { saveMeeting } from '../../utils/storage'
import { generateId } from '../../utils/idUtils'
import styles from '../Form.module.css'

interface Props {
  meeting: Meeting | null
  users: User[]
  onSaved: () => void
  onCancel: () => void
}

export default function MeetingForm({ meeting, users, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    userId: meeting?.userId ?? (users[0]?.id ?? ''),
    date: meeting?.date ?? new Date().toISOString().slice(0, 16),
    location: meeting?.location ?? '',
    participants: meeting?.participants ?? '',
    agenda: meeting?.agenda ?? '',
    discussion: meeting?.discussion ?? '',
    conclusion: meeting?.conclusion ?? '',
    futureTasks: meeting?.futureTasks ?? '',
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
    const saved: Meeting = {
      id: meeting?.id ?? generateId(),
      ...form,
      createdAt: meeting?.createdAt ?? new Date().toISOString(),
    }
    saveMeeting(saved)
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
          <label className={styles.label}>日時 <span className={styles.required}>*</span></label>
          <input className={styles.input} type="datetime-local" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>場所 <span className={styles.required}>*</span></label>
          <input className={styles.input} value={form.location} onChange={(e) => set('location', e.target.value)} required placeholder="利用者宅 / デイサービス 等" />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>参加者 <span className={styles.required}>*</span></label>
        <textarea className={styles.textarea} value={form.participants} onChange={(e) => set('participants', e.target.value)} required rows={2} placeholder="利用者名、家族名（続柄）、担当CM、各サービス担当者名" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>議題</label>
        <textarea className={styles.textarea} value={form.agenda} onChange={(e) => set('agenda', e.target.value)} rows={2} placeholder="会議の主な議題を記入" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>検討した内容</label>
        <textarea className={styles.textarea} value={form.discussion} onChange={(e) => set('discussion', e.target.value)} rows={3} placeholder="会議で検討・協議した内容を記入" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>結論</label>
        <textarea className={styles.textarea} value={form.conclusion} onChange={(e) => set('conclusion', e.target.value)} rows={2} placeholder="会議で決定した結論・方針を記入" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>今後の課題</label>
        <textarea className={styles.textarea} value={form.futureTasks} onChange={(e) => set('futureTasks', e.target.value)} rows={2} placeholder="今後対応が必要な課題を記入" />
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>キャンセル</button>
        <button type="submit" className={styles.btnPrimary}>保存</button>
      </div>
    </form>
  )
}
