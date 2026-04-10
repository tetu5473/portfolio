import { useState } from 'react'
import type { Monitoring, User } from '../../types'
import { getMonitoringList, deleteMonitoring, getUsers } from '../../utils/storage'
import { useListPage } from '../../hooks/useListPage'
import MonitoringForm from './MonitoringForm'
import styles from '../ListPage.module.css'

const byDateDesc = (a: Monitoring, b: Monitoring) => b.date.localeCompare(a.date)

export default function MonitoringList() {
  const [users] = useState<User[]>(() => getUsers())
  const { filtered, editing, showForm, filterUserId, setFilterUserId, handleSaved, handleEdit, handleNew, handleDelete, handleClose } =
    useListPage<Monitoring>({ fetchAll: getMonitoringList, deleteItem: deleteMonitoring, sort: byDateDesc })

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
        <button className={styles.btnPrimary} onClick={handleNew}>+ モニタリング追加</button>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>モニタリング記録がありません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>日付</th><th>利用者</th><th>記録者</th>
                <th>身体状態</th><th>精神状態</th><th>課題</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const user = users.find((u) => u.id === m.userId)
                return (
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => handleEdit(m)}>
                    <td>{m.date}</td>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td>{m.author}</td>
                    <td className={styles.preWrap}>{m.physicalCondition}</td>
                    <td className={styles.preWrap}>{m.mentalCondition}</td>
                    <td className={styles.preWrap}>{m.issues}</td>
                    <td className={styles.actions} onClick={(e) => e.stopPropagation()}>
                      <button className={styles.btnEdit} onClick={() => handleEdit(m)}>編集</button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(m.id, 'このモニタリング記録を削除しますか？')}>削除</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? 'モニタリング編集' : 'モニタリング追加'}</h2>
              <button className={styles.modalClose} onClick={handleClose}>✕</button>
            </div>
            <MonitoringForm monitoring={editing} users={users} onSaved={handleSaved} onCancel={handleClose} />
          </div>
        </div>
      )}
    </div>
  )
}
