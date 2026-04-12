import { useState } from 'react'
import type { Meeting, User } from '../../types'
import { getMeetings, deleteMeeting, getUsers } from '../../utils/storage'
import { useListPage } from '../../hooks/useListPage'
import MeetingForm from './MeetingForm'
import Modal from '../../components/Modal'
import UserFilterSelect from '../../components/UserFilterSelect'
import styles from '../ListPage.module.css'

const byDateDesc = (a: Meeting, b: Meeting) => b.date.localeCompare(a.date)

export default function MeetingList() {
  const [users] = useState<User[]>(() => getUsers())
  const { filtered, editing, showForm, filterUserId, setFilterUserId, handleSaved, handleEdit, handleNew, handleDelete, handleClose } =
    useListPage<Meeting>({ fetchAll: getMeetings, deleteItem: deleteMeeting, sort: byDateDesc })

  return (
    <div>
      <div className={styles.toolbar}>
        <UserFilterSelect users={users} value={filterUserId} onChange={setFilterUserId} count={filtered.length} />
        <button className={styles.btnPrimary} onClick={handleNew}>+ 会議追加</button>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>担当者会議記録がありません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>日時</th><th>利用者</th><th>場所</th><th>参加者</th>
                <th>議題</th><th>検討した内容</th><th>結論</th><th>今後の課題</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const user = users.find((u) => u.id === m.userId)
                return (
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => handleEdit(m)}>
                    <td>{m.date.replace('T', ' ')}</td>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td>{m.location}</td>
                    <td className={styles.preWrap}>{m.participants}</td>
                    <td className={styles.preWrap}>{m.agenda}</td>
                    <td className={styles.preWrap}>{m.discussion}</td>
                    <td className={styles.preWrap}>{m.conclusion}</td>
                    <td className={styles.preWrap}>{m.futureTasks}</td>
                    <td className={styles.actions} onClick={(e) => e.stopPropagation()}>
                      <button className={styles.btnEdit} onClick={() => handleEdit(m)}>編集</button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(m.id, 'この会議記録を削除しますか？')}>削除</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={showForm} title={editing ? '担当者会議編集' : '担当者会議追加'} onClose={handleClose}>
        <MeetingForm meeting={editing} users={users} onSaved={handleSaved} onCancel={handleClose} />
      </Modal>
    </div>
  )
}
