import { useState } from 'react'
import type { CarePlan, User } from '../../types'
import { saveCarePlan } from '../../utils/storage'
import { generateId } from '../../utils/idUtils'
import styles from '../Form.module.css'

interface Props {
  plan: CarePlan | null
  users: User[]
  onSaved: () => void
  onCancel: () => void
}

export default function CarePlanForm({ plan, users, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    userId: plan?.userId ?? (users[0]?.id ?? ''),
    longTermGoal: plan?.longTermGoal ?? '',
    shortTermGoal: plan?.shortTermGoal ?? '',
    services: plan?.services ?? '',
    startDate: plan?.startDate ?? '',
    endDate: plan?.endDate ?? '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const saved: CarePlan = {
      id: plan?.id ?? generateId(),
      ...form,
      createdAt: plan?.createdAt ?? new Date().toISOString(),
    }
    saveCarePlan(saved)
    onSaved()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>利用者 <span className={styles.required}>*</span></label>
        <select className={styles.select} value={form.userId} onChange={(e) => set('userId', e.target.value)} required>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>長期目標 <span className={styles.required}>*</span></label>
        <textarea className={styles.textarea} value={form.longTermGoal} onChange={(e) => set('longTermGoal', e.target.value)} required rows={3} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>短期目標 <span className={styles.required}>*</span></label>
        <textarea className={styles.textarea} value={form.shortTermGoal} onChange={(e) => set('shortTermGoal', e.target.value)} required rows={3} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>サービス内容 <span className={styles.required}>*</span></label>
        <textarea className={styles.textarea} value={form.services} onChange={(e) => set('services', e.target.value)} required rows={3} />
      </div>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>開始日 <span className={styles.required}>*</span></label>
          <input className={styles.input} type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>終了日 <span className={styles.required}>*</span></label>
          <input className={styles.input} type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} required />
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>キャンセル</button>
        <button type="submit" className={styles.btnPrimary}>保存</button>
      </div>
    </form>
  )
}
