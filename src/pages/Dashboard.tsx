import { useState } from 'react'
import { getUsers, getCarePlans, getProgressNotes, getMeetings } from '../utils/storage'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [users] = useState(() => getUsers())
  const [carePlans] = useState(() => getCarePlans())
  const [progressNotes] = useState(() => getProgressNotes())
  const [meetings] = useState(() => getMeetings())

  const stats = [
    { label: '利用者数', value: users.length, unit: '名', color: '#2563EB' },
    { label: 'ケアプラン', value: carePlans.length, unit: '件', color: '#0891B2' },
    { label: '支援経過', value: progressNotes.length, unit: '件', color: '#059669' },
    { label: '担当者会議', value: meetings.length, unit: '件', color: '#D97706' },
  ]

  const recentNotes = [...progressNotes]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard} style={{ borderTopColor: s.color }}>
            <div className={styles.statValue} style={{ color: s.color }}>
              {s.value}
              <span className={styles.statUnit}>{s.unit}</span>
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.row}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>最近の支援経過</h2>
          {recentNotes.length === 0 ? (
            <p className={styles.empty}>記録がありません</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>日付</th>
                  <th>利用者</th>
                  <th>記録者</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
                {recentNotes.map((note) => {
                  const user = users.find((u) => u.id === note.userId)
                  return (
                    <tr key={note.id}>
                      <td>{note.date}</td>
                      <td>{user?.name ?? '—'}</td>
                      <td>{note.author}</td>
                      <td className={styles.truncate}>{note.content}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.sideCards}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>利用者一覧</h2>
            {users.length === 0 ? (
              <p className={styles.empty}>利用者がいません</p>
            ) : (
              <ul className={styles.userList}>
                {users.map((u) => (
                  <li key={u.id} className={styles.userItem}>
                    <span className={styles.userName}>{u.name}</span>
                    <span className={styles.careLevel}>{u.careLevel}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
