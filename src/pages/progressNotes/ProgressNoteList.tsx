/**
 * ProgressNoteList.tsx — 支援経過一覧ページ
 * 利用者フィルタ・日付降順表示・追加・編集・削除・Excel/PDF エクスポートを行う
 */
import { useState } from 'react'
import type { ProgressNote, User } from '../../types'
import { getProgressNotes, deleteProgressNote, getUsers } from '../../utils/storage'
import { exportProgressNotes } from '../../utils/excelUtils'
import { exportProgressNotesPDF } from '../../utils/pdfUtils'
// useCrudList: 一覧表示に必要な状態管理・操作をまとめたカスタムフック（旧: useListPage）
import { useCrudList } from '../../hooks/useCrudList'
import ProgressNoteForm from './ProgressNoteForm'
import Modal from '../../components/Modal'
import UserFilterSelect from '../../components/UserFilterSelect'
import styles from '../ListPage.module.css'

// byDateDesc: 日付の新しい順（降順）で並べるソート関数
const byDateDesc = (a: ProgressNote, b: ProgressNote) => b.date.localeCompare(a.date)

export default function ProgressNoteList() {
  // 利用者一覧: フィルター選択肢の表示と userId→氏名変換に使う
  const [users] = useState<User[]>(() => getUsers())
  // useCrudListからフィルタ済みリスト・編集状態・各操作関数を取り出す
  const { filteredItems, editing, showForm, filterUserId, setFilterUserId, handleSave, handleEdit, handleNew, handleDelete, handleClose } =
    useCrudList<ProgressNote>({ fetchAll: getProgressNotes, deleteItem: deleteProgressNote, sort: byDateDesc })

  return (
    <div>
      <div className={styles.toolbar}>
        {/* 利用者フィルター: 選択中の件数も表示する */}
        <UserFilterSelect users={users} value={filterUserId} onChange={setFilterUserId} count={filteredItems.length} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.btnEdit} onClick={() => exportProgressNotes()}>Excelエクスポート</button>
          {/* PDFエクスポート: フィルタ後のデータを印刷対象にする */}
          <button className={styles.btnEdit} onClick={() => exportProgressNotesPDF(filteredItems, users)}>PDFエクスポート</button>
          <button className={styles.btnPrimary} onClick={handleNew}>+ 記録追加</button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.empty}>支援経過記録がありません</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>日付</th><th>利用者</th><th>記録者</th><th>内容</th><th>操作</th></tr>
            </thead>
            <tbody>
              {/* filteredItems: 利用者フィルターが選択されている場合のみ絞り込んだ結果を表示する */}
              {filteredItems.map((n) => {
                // userId から利用者名を逆引きして表示する
                const user = users.find((u) => u.id === n.userId)
                return (
                  // 行クリックで編集モーダルを開く
                  <tr key={n.id} style={{ cursor: 'pointer' }} onClick={() => handleEdit(n)}>
                    <td>{n.date}</td>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td>{n.author}</td>
                    <td className={styles.preWrap}>{n.content}</td>
                    {/* e.stopPropagation(): 操作ボタンのクリックが行全体のクリックに伝わらないようにする */}
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

      {/* editing が null なら新規追加モーダル、値があれば編集モーダルとして開く */}
      <Modal show={showForm} title={editing ? '支援経過編集' : '支援経過追加'} onClose={handleClose}>
        <ProgressNoteForm note={editing} users={users} onSaved={handleSave} onCancel={handleClose} />
      </Modal>
    </div>
  )
}
