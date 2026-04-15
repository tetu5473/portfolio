/**
 * UserFilterSelect.tsx — 利用者フィルタリング用セレクトボックスコンポーネント
 * 一覧ページで利用者を絞り込む際に使用する共通コンポーネント
 */
import type { User } from '../types'
import styles from '../pages/ListPage.module.css'

interface UserFilterSelectProps {
  users: User[]
  value: string
  onChange: (userId: string) => void
  count: number
}

export default function UserFilterSelect({ users, value, onChange, count }: UserFilterSelectProps) {
  return (
    <div className={styles.filterBar}>
      <select
        className={styles.filterSelect}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">全利用者</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
      <span className={styles.count}>{count}件</span>
    </div>
  )
}
