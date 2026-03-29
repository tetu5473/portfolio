import { useState } from 'react'
import type { Monitoring, User } from '../../types'
import { saveMonitoring } from '../../utils/storage'
import { generateId } from '../../utils/idUtils'
import styles from '../Form.module.css'

interface Props {
  monitoring: Monitoring | null
  users: User[]
  onSaved: () => void
  onCancel: () => void
}

export default function MonitoringForm({ monitoring, users, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    userId: monitoring?.userId ?? (users[0]?.id ?? ''),
    date: monitoring?.date ?? new Date().toISOString().slice(0, 10),
    author: monitoring?.author ?? '',
    physicalCondition: monitoring?.physicalCondition ?? '',
    mentalCondition: monitoring?.mentalCondition ?? '',
    serviceStatus: monitoring?.serviceStatus ?? '',
    issues: monitoring?.issues ?? '',
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
    const saved: Monitoring = {
      id: monitoring?.id ?? generateId(),
      ...form,
      createdAt: monitoring?.createdAt ?? new Date().toISOString(),
    }
    saveMonitoring(saved)
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
          <label className={styles.label}>実施日 <span className={styles.required}>*</span></label>
          <input className={styles.input} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>記録者 <span className={styles.required}>*</span></label>
          <input className={styles.input} value={form.author} onChange={(e) => set('author', e.target.value)} required placeholder="田中 美咲" />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>身体状態</label>
        <textarea className={styles.textarea} value={form.physicalCondition} onChange={(e) => set('physicalCondition', e.target.value)} rows={3} placeholder="体重、食欲、睡眠、疼痛等" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>精神状態</label>
        <textarea className={styles.textarea} value={form.mentalCondition} onChange={(e) => set('mentalCondition', e.target.value)} rows={3} placeholder="気分、意欲、認知機能等" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>サービス利用状況</label>
        <textarea className={styles.textarea} value={form.serviceStatus} onChange={(e) => set('serviceStatus', e.target.value)} rows={3} placeholder="各サービスの利用状況・満足度等" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>課題・特記事項</label>
        <textarea className={styles.textarea} value={form.issues} onChange={(e) => set('issues', e.target.value)} rows={3} placeholder="新たな課題・リスク等" />
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>キャンセル</button>
        <button type="submit" className={styles.btnPrimary}>保存</button>
      </div>
    </form>
  )
}
