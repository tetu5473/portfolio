/**
 * MonitoringList.tsx — モニタリング一覧ページ
 * 利用者フィルタ・日付降順表示・追加・編集・削除を行う
 */
import { useState } from 'react'
import type { Monitoring, User } from '../../types'
import { getMonitoringList, deleteMonitoring, getUsers } from '../../utils/storage'
import { exportMonitoringsPDF } from '../../utils/pdfUtils'
// useCrudList: 一覧表示に必要な状態管理・操作をまとめたカスタムフック（旧: useListPage）
import { useCrudList } from '../../hooks/useCrudList'
import MonitoringForm from './MonitoringForm'
import Modal from '../../components/Modal'
import UserFilterSelect from '../../components/UserFilterSelect'
import styles from '../ListPage.module.css'

const byDateDesc = (a: Monitoring, b: Monitoring) => b.date.localeCompare(a.date)

export default function MonitoringList() {
  const [users] = useState<User[]>(() => getUsers())
  const { filteredItems, editing, showForm, filterUserId, setFilterUserId, handleSave, handleEdit, handleNew, handleDelete, handleClose } =
    useCrudList<Monitoring>({ fetchAll: getMonitoringList, deleteItem: deleteMonitoring, sort: byDateDesc })

  return (
    <div>
      <div className={styles.toolbar}>
        <UserFilterSelect users={users} value={filterUserId} onChange={setFilterUserId} count={filteredItems.length} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* PDFエクスポート: ブラウザの print 機能で日本語を正しく出力する */}
          <button className={styles.btnEdit} onClick={() => exportMonitoringsPDF(filteredItems, users)}>PDFエクスポート</button>
          <button className={styles.btnPrimary} onClick={handleNew}>+ モニタリング追加</button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
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
              {filteredItems.map((m) => {
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

      <Modal show={showForm} title={editing ? 'モニタリング編集' : 'モニタリング追加'} onClose={handleClose}>
        <MonitoringForm monitoring={editing} users={users} onSaved={handleSave} onCancel={handleClose} />
      </Modal>
    </div>
  )
}
