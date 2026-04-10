import { useState } from 'react'
import type { CarePlan, User } from '../../types'
import { getCarePlans, deleteCarePlan, getUsers } from '../../utils/storage'
import { exportCarePlans } from '../../utils/excelUtils'
import { useListPage } from '../../hooks/useListPage'
import CarePlanForm from './CarePlanForm'
import styles from '../ListPage.module.css'

export default function CarePlanList() {
  const [users] = useState<User[]>(() => getUsers())
  const { filtered, editing, showForm, filterUserId, setFilterUserId, handleSaved, handleEdit, handleNew, handleDelete, handleClose } =
    useListPage<CarePlan>({ fetchAll: getCarePlans, deleteItem: deleteCarePlan })

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
          <button className={styles.btnEdit} onClick={() => exportCarePlans()}>Excelエクスポート</button>
          <button className={styles.btnPrimary} onClick={handleNew}>+ ケアプラン追加</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>ケアプランが登録されていません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>利用者</th><th>長期目標</th><th>短期目標</th>
                <th>サービス内容</th><th>開始日</th><th>終了日</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const user = users.find((u) => u.id === p.userId)
                return (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => handleEdit(p)}>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td className={styles.preWrap}>{p.longTermGoal}</td>
                    <td className={styles.preWrap}>{p.shortTermGoal}</td>
                    <td className={styles.preWrap}>{p.services}</td>
                    <td>{p.startDate}</td>
                    <td>{p.endDate}</td>
                    <td className={styles.actions} onClick={(e) => e.stopPropagation()}>
                      <button className={styles.btnEdit} onClick={() => handleEdit(p)}>編集</button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(p.id, 'このケアプランを削除しますか？')}>削除</button>
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
              <h2>{editing ? 'ケアプラン編集' : 'ケアプラン追加'}</h2>
              <button className={styles.modalClose} onClick={handleClose}>✕</button>
            </div>
            <CarePlanForm plan={editing} users={users} onSaved={handleSaved} onCancel={handleClose} />
          </div>
        </div>
      )}
    </div>
  )
}
