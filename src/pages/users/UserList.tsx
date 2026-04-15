/**
 * UserList.tsx — 利用者一覧ページ
 * 利用者の一覧表示・追加・編集・削除・Excel インポート/エクスポートを行う
 */
import { useRef, useState, type ChangeEvent } from 'react'
// useNavigate: 別のページへ移動するための機能
import { useNavigate } from 'react-router-dom'
import type { User } from '../../types'
import { getUsers, deleteUser } from '../../utils/storage'
import { exportUsers, importUsers } from '../../utils/excelUtils'
// useCrudList: 一覧表示に必要な状態管理・操作をまとめたカスタムフック（旧: useListPage）
import { useCrudList } from '../../hooks/useCrudList'
import UserForm from './UserForm'
import Modal from '../../components/Modal'
import styles from '../ListPage.module.css'

export default function UserList() {
  // navigate: ページ移動に使う関数
  const navigate = useNavigate()
  // useCrudListから一覧表示・編集・削除に必要な変数と関数を取り出す
  const { list: users, editing, showForm, handleSave, handleEdit, handleNew, handleDelete, handleClose } =
    useCrudList<User>({ fetchAll: getUsers, deleteItem: deleteUser })
  const importRef = useRef<HTMLInputElement>(null)

  // インポート結果をUIで表示するためのstate（window.alert の代わりにインライン表示）
  const [importResult, setImportResult] = useState<{ count: number; errors: string[] } | null>(null)

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { count, errors } = await importUsers(file)
    handleSave()
    if (importRef.current) importRef.current.value = ''
    // alert() の代わりにstateで結果を保持し、画面内にメッセージを表示する
    setImportResult({ count, errors })
    // 5秒後にメッセージを自動で消す
    setTimeout(() => setImportResult(null), 5000)
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

      {/* インポート結果メッセージ: window.alert の代わりにインライン表示 */}
      {importResult && (
        <div style={{
          padding: '10px 16px',
          marginBottom: '12px',
          borderRadius: '6px',
          fontSize: '13px',
          background: importResult.errors.length > 0 ? '#FFFBEB' : '#F0FDF4',
          border: `1px solid ${importResult.errors.length > 0 ? '#FCD34D' : '#86EFAC'}`,
          color: importResult.errors.length > 0 ? '#92400E' : '#166534',
        }}>
          {/* 成功件数を表示 */}
          {importResult.count}件インポートしました。
          {/* 警告がある場合は追記 */}
          {importResult.errors.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              警告: {importResult.errors.join(' / ')}
            </div>
          )}
        </div>
      )}

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
        <UserForm user={editing} onSaved={handleSave} onCancel={handleClose} />
      </Modal>
    </div>
  )
}
