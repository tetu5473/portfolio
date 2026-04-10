import { useState } from 'react'
import type { ProgressNote, User } from '../../types'
import { getProgressNotes, deleteProgressNote, getUsers } from '../../utils/storage'
import { exportProgressNotes } from '../../utils/excelUtils'
import { exportProgressNotesPDF } from '../../utils/pdfUtils'
import { useListPage } from '../../hooks/useListPage'
import ProgressNoteForm from './ProgressNoteForm'
import styles from '../ListPage.module.css'

const byDateDesc = (a: ProgressNote, b: ProgressNote) => b.date.localeCompare(a.date)

export default function ProgressNoteList() {
  const [users] = useState<User[]>(() => getUsers())
  const { filtered, editing, showForm, filterUserId, setFilterUserId, handleSaved, handleEdit, handleNew, handleDelete, handleClose } =
    useListPage<ProgressNote>({ fetchAll: getProgressNotes, deleteItem: deleteProgressNote, sort: byDateDesc })

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
          <button className={styles.btnEdit} onClick={() => exportProgressNotes()}>Excelエクスポート</button>
          <button className={styles.btnEdit} onClick={() => exportProgressNotesPDF(filtered, users)}>PDFエクスポート</button>
          <button className={styles.btnPrimary} onClick={handleNew}>+ 記録追加</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>支援経過記録がありません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>日付</th><th>利用者</th><th>記録者</th><th>内容</th><th>操作</th></tr>
            </thead>
            <tbody>
              {filtered.map((n) => {
                const user = users.find((u) => u.id === n.userId)
                return (
                  <tr key={n.id} style={{ cursor: 'pointer' }} onClick={() => handleEdit(n)}>
                    <td>{n.date}</td>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td>{n.author}</td>
                    <td className={styles.preWrap}>{n.content}</td>
                    <td className={styles.actions} onClick={(e) => e.stopPropagation()}>
                      <button className={styles.btnEdit} onClick={() => handleEdit(n)}>編集</button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(n.id, 'この記録を削除しますか？')}>削除</button>
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
              <h2>{editing ? '支援経過編集' : '支援経過追加'}</h2>
              <button className={styles.modalClose} onClick={handleClose}>✕</button>
            </div>
            <ProgressNoteForm note={editing} users={users} onSaved={handleSaved} onCancel={handleClose} />
          </div>
        </div>
      )}
    </div>
  )
}
