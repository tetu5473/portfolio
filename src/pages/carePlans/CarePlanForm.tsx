/**
 * CarePlanForm.tsx — ケアプラン追加・編集フォームコンポーネント
 * plan が null のとき新規追加、値があるとき編集モードとして動作する
 */
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
  // 編集時は既存データを初期値にセット。新規追加時は先頭の利用者を初期選択する
  const [form, setForm] = useState({
    userId: plan?.userId ?? (users[0]?.id ?? ''),
    longTermGoal: plan?.longTermGoal ?? '',
    shortTermGoal: plan?.shortTermGoal ?? '',
    services: plan?.services ?? '',
    startDate: plan?.startDate ?? '',
    endDate: plan?.endDate ?? '',
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
    const saved: CarePlan = {
      // 編集時は既存 id を維持し、新規追加時は一意な id を生成する
      id: plan?.id ?? generateId(),
      ...form,
      // createdAt は初回作成時のみ設定し、編集時は変更しない
      createdAt: plan?.createdAt ?? new Date().toISOString(),
    }
    saveCarePlan(saved)
    onSaved()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
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
      {/* grid2: 開始日と終了日を横並びに表示するグリッドレイアウト */}
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
