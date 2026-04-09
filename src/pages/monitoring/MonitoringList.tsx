import { useState } from 'react'
import type { Monitoring, User } from '../../types'
import { getMonitoringList, deleteMonitoring, getUsers } from '../../utils/storage'
import MonitoringForm from './MonitoringForm'
import styles from '../ListPage.module.css'

export default function MonitoringList() {
  const [list, setList] = useState<Monitoring[]>(() =>
    [...getMonitoringList()].sort((a, b) => b.date.localeCompare(a.date))
  )
  const [users] = useState<User[]>(() => getUsers())
  const [editing, setEditing] = useState<Monitoring | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterUserId, setFilterUserId] = useState('')

  function handleSaved() {
    setList([...getMonitoringList()].sort((a, b) => b.date.localeCompare(a.date)))
    setShowForm(false)
    setEditing(null)
  }

  function handleDelete(id: string) {
    if (!window.confirm('このモニタリング記録を削除しますか？')) return
    deleteMonitoring(id)
    setList([...getMonitoringList()].sort((a, b) => b.date.localeCompare(a.date)))
  }

  const filtered = filterUserId ? list.filter((m) => m.userId === filterUserId) : list

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
          + モニタリング追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>モニタリング記録がありません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>日付</th>
                <th>利用者</th>
                <th>記録者</th>
                <th>身体状態</th>
                <th>精神状態</th>
                <th>課題</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const user = users.find((u) => u.id === m.userId)
                return (
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => { setEditing(m); setShowForm(true) }}>
                    <td>{m.date}</td>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td>{m.author}</td>
                    <td className={styles.preWrap}>{m.physicalCondition}</td>
                    <td className={styles.preWrap}>{m.mentalCondition}</td>
                    <td className={styles.preWrap}>{m.issues}</td>
                    <td className={styles.actions} onClick={(e) => e.stopPropagation()}>
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
              <h2>{editing ? 'モニタリング編集' : 'モニタリング追加'}</h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <MonitoringForm monitoring={editing} users={users} onSaved={handleSaved} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
