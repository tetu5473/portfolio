/**
 * UserForm.tsx — 利用者追加・編集フォームコンポーネント
 * user が null のとき新規追加、値があるとき編集モードとして動作する
 */
import { useState } from 'react'
import type { User } from '../../types'
import { saveUser } from '../../utils/storage'
import { generateId } from '../../utils/idUtils'
import styles from '../Form.module.css'

interface Props {
  user: User | null
  onSaved: () => void
  onCancel: () => void
}

const CARE_LEVELS: User['careLevel'][] = [
  '要支援1', '要支援2', '要介護1', '要介護2', '要介護3', '要介護4', '要介護5',
]

export default function UserForm({ user, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<Omit<User, 'id' | 'createdAt'>>({
    name: user?.name ?? '',
    nameKana: user?.nameKana ?? '',
    birthDate: user?.birthDate ?? '',
    gender: user?.gender ?? 'female',
    careLevel: user?.careLevel ?? '要介護1',
    address: user?.address ?? '',
    phone: user?.phone ?? '',
    emergencyContact: user?.emergencyContact ?? '',
    staffName: user?.staffName ?? '',
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
    const saved: User = {
      id: user?.id ?? generateId(),
      ...form,
      createdAt: user?.createdAt ?? new Date().toISOString(),
    }
    saveUser(saved)
    onSaved()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>氏名 <span className={styles.required}>*</span></label>
          <input
            className={styles.input}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="山田 花子"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>ふりがな <span className={styles.required}>*</span></label>
          <input
            className={styles.input}
            value={form.nameKana}
            onChange={(e) => set('nameKana', e.target.value)}
            required
            placeholder="ヤマダ ハナコ"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>生年月日 <span className={styles.required}>*</span></label>
          <input
            className={styles.input}
            type="date"
            value={form.birthDate}
            onChange={(e) => set('birthDate', e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>性別 <span className={styles.required}>*</span></label>
          <select
            className={styles.select}
            value={form.gender}
            onChange={(e) => set('gender', e.target.value as User['gender'])}
          >
            <option value="female">女性</option>
            <option value="male">男性</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>介護度 <span className={styles.required}>*</span></label>
          <select
            className={styles.select}
            value={form.careLevel}
            onChange={(e) => set('careLevel', e.target.value as User['careLevel'])}
          >
            {CARE_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>担当者名 <span className={styles.required}>*</span></label>
          <input
            className={styles.input}
            value={form.staffName}
            onChange={(e) => set('staffName', e.target.value)}
            required
            placeholder="田中 美咲"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>電話番号</label>
          <input
            className={styles.input}
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="03-1234-5678"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>緊急連絡先</label>
          <input
            className={styles.input}
            value={form.emergencyContact}
            onChange={(e) => set('emergencyContact', e.target.value)}
            placeholder="山田 太郎（息子）090-1234-5678"
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>住所</label>
        <input
          className={styles.input}
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder="東京都新宿区..."
        />
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" className={styles.btnPrimary}>
          保存
        </button>
      </div>
    </form>
  )
}
