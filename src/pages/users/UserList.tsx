import { useState, useRef, type ChangeEvent } from 'react'
import type { User } from '../../types'
import { getUsers, deleteUser } from '../../utils/storage'
import { exportUsers, importUsers } from '../../utils/excelUtils'
import UserForm from './UserForm'
import styles from '../ListPage.module.css'

export default function UserList() {
  const [users, setUsers] = useState<User[]>(() => getUsers())
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  function handleSaved() {
    setUsers(getUsers())
    setShowForm(false)
    setEditingUser(null)
  }

  function handleEdit(user: User) {
    setEditingUser(user)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    if (!window.confirm('この利用者を削除しますか？')) return
    deleteUser(id)
    setUsers(getUsers())
  }

  function handleNew() {
    setEditingUser(null)
    setShowForm(true)
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { count, errors } = await importUsers(file)
    setUsers(getUsers())
    if (importRef.current) importRef.current.value = ''
    const msg = `${count}件インポートしました。${errors.length > 0 ? '\n警告:\n' + errors.join('\n') : ''}`
    window.alert(msg)
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <span className={styles.count}>{users.length}名</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.btnEdit} onClick={() => exportUsers()}>
            Excelエクスポート
          </button>
          <button className={styles.btnEdit} onClick={() => importRef.current?.click()}>
            Excelインポート
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button className={styles.btnPrimary} onClick={handleNew}>
            + 利用者追加
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className={styles.empty}>利用者が登録されていません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>氏名</th>
                <th>ふりがな</th>
                <th>生年月日</th>
                <th>性別</th>
                <th>介護度</th>
                <th>担当者</th>
                <th>電話番号</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => handleEdit(u)}>
                  <td className={styles.bold}>{u.name}</td>
                  <td>{u.nameKana}</td>
                  <td>{u.birthDate}</td>
                  <td>{u.gender === 'male' ? '男性' : '女性'}</td>
                  <td>
                    <span className={styles.badge}>{u.careLevel}</span>
                  </td>
                  <td>{u.staffName}</td>
                  <td>{u.phone}</td>
                  <td className={styles.actions} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.btnEdit} onClick={() => handleEdit(u)}>
                      編集
                    </button>
                    <button className={styles.btnDelete} onClick={() => handleDelete(u.id)}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingUser ? '利用者編集' : '利用者追加'}</h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <UserForm user={editingUser} onSaved={handleSaved} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
