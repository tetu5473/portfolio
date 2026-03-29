import { useState } from 'react'
import type { ProgressNote, User } from '../../types'
import { getProgressNotes, deleteProgressNote, getUsers } from '../../utils/storage'
import { exportProgressNotes } from '../../utils/excelUtils'
import ProgressNoteForm from './ProgressNoteForm'
import styles from '../ListPage.module.css'

export default function ProgressNoteList() {
  const [notes, setNotes] = useState<ProgressNote[]>(() =>
    [...getProgressNotes()].sort((a, b) => b.date.localeCompare(a.date))
  )
  const [users] = useState<User[]>(() => getUsers())
  const [editing, setEditing] = useState<ProgressNote | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterUserId, setFilterUserId] = useState('')

  function handleSaved() {
    setNotes([...getProgressNotes()].sort((a, b) => b.date.localeCompare(a.date)))
    setShowForm(false)
    setEditing(null)
  }

  function handleDelete(id: string) {
    if (!window.confirm('この記録を削除しますか？')) return
    deleteProgressNote(id)
    setNotes([...getProgressNotes()].sort((a, b) => b.date.localeCompare(a.date)))
  }

  const filtered = filterUserId ? notes.filter((n) => n.userId === filterUserId) : notes

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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.btnEdit} onClick={() => exportProgressNotes()}>
            Excelエクスポート
          </button>
          <button className={styles.btnPrimary} onClick={() => { setEditing(null); setShowForm(true) }}>
            + 記録追加
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>支援経過記録がありません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>日付</th>
                <th>利用者</th>
                <th>記録者</th>
                <th>内容</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => {
                const user = users.find((u) => u.id === n.userId)
                return (
                  <tr key={n.id}>
                    <td>{n.date}</td>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td>{n.author}</td>
                    <td className={styles.preWrap}>{n.content}</td>
                    <td className={styles.actions}>
                      <button className={styles.btnEdit} onClick={() => { setEditing(n); setShowForm(true) }}>編集</button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(n.id)}>削除</button>
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
              <h2>{editing ? '支援経過編集' : '支援経過追加'}</h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <ProgressNoteForm note={editing} users={users} onSaved={handleSaved} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
