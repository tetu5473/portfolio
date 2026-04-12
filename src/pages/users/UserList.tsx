import { useRef, type ChangeEvent } from 'react'
// useNavigate: 別のページへ移動するための機能
import { useNavigate } from 'react-router-dom'
import type { User } from '../../types'
import { getUsers, deleteUser } from '../../utils/storage'
import { exportUsers, importUsers } from '../../utils/excelUtils'
// useListPage: 一覧表示に必要な状態管理・操作をまとめたカスタムフック
import { useListPage } from '../../hooks/useListPage'
import UserForm from './UserForm'
import Modal from '../../components/Modal'
import styles from '../ListPage.module.css'

export default function UserList() {
  // navigate: ページ移動に使う関数
  const navigate = useNavigate()
  // useListPageから一覧表示・編集・削除に必要な変数と関数を取り出す
  const { list: users, editing, showForm, handleSaved, handleEdit, handleNew, handleDelete, handleClose } =
    useListPage<User>({ fetchAll: getUsers, deleteItem: deleteUser })
  const importRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { count, errors } = await importUsers(file)
    handleSaved()
    if (importRef.current) importRef.current.value = ''
    window.alert(`${count}件インポートしました。${errors.length > 0 ? '\n警告:\n' + errors.join('\n') : ''}`)
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <span className={styles.count}>{users.length}名</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.btnEdit} onClick={() => exportUsers()}>Excelエクスポート</button>
          <button className={styles.btnEdit} onClick={() => importRef.current?.click()}>Excelインポート</button>
          <input ref={importRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
          <button className={styles.btnPrimary} onClick={handleNew}>+ 利用者追加</button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className={styles.empty}>利用者が登録されていません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>氏名</th><th>ふりがな</th><th>生年月日</th><th>性別</th>
                <th>介護度</th><th>担当者</th><th>電話番号</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                // 行をクリックしたら /users/利用者ID のプロフィールページへ移動する
                <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/users/${u.id}`)}>
                  <td className={styles.bold}>{u.name}</td>
                  <td>{u.nameKana}</td>
                  <td>{u.birthDate}</td>
                  <td>{u.gender === 'male' ? '男性' : '女性'}</td>
                  <td><span className={styles.badge}>{u.careLevel}</span></td>
                  <td>{u.staffName}</td>
                  <td>{u.phone}</td>
                  {/* e.stopPropagation(): 操作列のクリックが行全体のクリックに伝わらないようにする */}
                  <td className={styles.actions} onClick={(e) => e.stopPropagation()}>
                    {/* 編集ボタンは引き続き編集モーダルを開く */}
                    <button className={styles.btnEdit} onClick={() => handleEdit(u)}>編集</button>
                    <button className={styles.btnDelete} onClick={() => handleDelete(u.id, 'この利用者を削除しますか？')}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={showForm} title={editing ? '利用者編集' : '利用者追加'} onClose={handleClose}>
        <UserForm user={editing} onSaved={handleSaved} onCancel={handleClose} />
      </Modal>
    </div>
  )
}
