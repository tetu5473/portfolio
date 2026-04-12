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
