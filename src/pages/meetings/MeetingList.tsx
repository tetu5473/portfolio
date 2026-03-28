import { useState } from 'react'
import type { Meeting, User } from '../../types'
import { getMeetings, deleteMeeting, getUsers } from '../../utils/storage'
import MeetingForm from './MeetingForm'
import styles from '../ListPage.module.css'

export default function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>(() =>
    [...getMeetings()].sort((a, b) => b.date.localeCompare(a.date))
  )
  const [users] = useState<User[]>(() => getUsers())
  const [editing, setEditing] = useState<Meeting | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterUserId, setFilterUserId] = useState('')

  function handleSaved() {
    setMeetings([...getMeetings()].sort((a, b) => b.date.localeCompare(a.date)))
    setShowForm(false)
    setEditing(null)
  }

  function handleDelete(id: string) {
    if (!window.confirm('この会議記録を削除しますか？')) return
    deleteMeeting(id)
    setMeetings([...getMeetings()].sort((a, b) => b.date.localeCompare(a.date)))
  }

  const filtered = filterUserId ? meetings.filter((m) => m.userId === filterUserId) : meetings

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.filterBar}>
          <select className={styles.filterSelect} value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)}>
            <option value="">全利用者</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <span className={styles.count}>{filtered.length}件</span>
        </div>
        <button className={styles.btnPrimary} onClick={() => { setEditing(null); setShowForm(true) }}>
          + 会議追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>担当者会議記録がありません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>日時</th>
                <th>利用者</th>
                <th>場所</th>
                <th>参加者</th>
                <th>議題</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const user = users.find((u) => u.id === m.userId)
                return (
                  <tr key={m.id}>
                    <td>{m.date.replace('T', ' ')}</td>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td>{m.location}</td>
                    <td className={styles.preWrap}>{m.participants}</td>
                    <td className={styles.preWrap}>{m.agenda}</td>
                    <td className={styles.actions}>
                      <button className={styles.btnEdit} onClick={() => { setEditing(m); setShowForm(true) }}>編集</button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(m.id)}>削除</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? '担当者会議編集' : '担当者会議追加'}</h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <MeetingForm meeting={editing} users={users} onSaved={handleSaved} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
