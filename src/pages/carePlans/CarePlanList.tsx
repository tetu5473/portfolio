import { useState } from 'react'
import type { CarePlan, User } from '../../types'
import { getCarePlans, deleteCarePlan, getUsers } from '../../utils/storage'
import { exportCarePlans } from '../../utils/excelUtils'
import CarePlanForm from './CarePlanForm'
import styles from '../ListPage.module.css'

export default function CarePlanList() {
  const [plans, setPlans] = useState<CarePlan[]>(() => getCarePlans())
  const [users] = useState<User[]>(() => getUsers())
  const [editing, setEditing] = useState<CarePlan | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterUserId, setFilterUserId] = useState('')

  function handleSaved() {
    setPlans(getCarePlans())
    setShowForm(false)
    setEditing(null)
  }

  function handleDelete(id: string) {
    if (!window.confirm('このケアプランを削除しますか？')) return
    deleteCarePlan(id)
    setPlans(getCarePlans())
  }

  const filtered = filterUserId ? plans.filter((p) => p.userId === filterUserId) : plans

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.filterBar}>
          <select
            className={styles.filterSelect}
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
          >
            <option value="">全利用者</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <span className={styles.count}>{filtered.length}件</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.btnEdit} onClick={() => exportCarePlans()}>
            Excelエクスポート
          </button>
          <button className={styles.btnPrimary} onClick={() => { setEditing(null); setShowForm(true) }}>
            + ケアプラン追加
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>ケアプランが登録されていません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>利用者</th>
                <th>長期目標</th>
                <th>短期目標</th>
                <th>サービス内容</th>
                <th>開始日</th>
                <th>終了日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const user = users.find((u) => u.id === p.userId)
                return (
                  <tr key={p.id}>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td className={styles.preWrap}>{p.longTermGoal}</td>
                    <td className={styles.preWrap}>{p.shortTermGoal}</td>
                    <td className={styles.preWrap}>{p.services}</td>
                    <td>{p.startDate}</td>
                    <td>{p.endDate}</td>
                    <td className={styles.actions}>
                      <button className={styles.btnEdit} onClick={() => { setEditing(p); setShowForm(true) }}>編集</button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(p.id)}>削除</button>
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
              <h2>{editing ? 'ケアプラン編集' : 'ケアプラン追加'}</h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <CarePlanForm plan={editing} users={users} onSaved={handleSaved} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
