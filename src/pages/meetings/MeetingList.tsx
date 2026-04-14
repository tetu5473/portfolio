/**
 * MeetingList.tsx — 担当者会議一覧ページ
 * 利用者フィルタ・日付降順表示・追加・編集・削除を行う
 */
import { useState } from 'react'
import type { Meeting, User } from '../../types'
import { getMeetings, deleteMeeting, getUsers } from '../../utils/storage'
// useCrudList: 一覧表示に必要な状態管理・操作をまとめたカスタムフック（旧: useListPage）
import { useCrudList } from '../../hooks/useCrudList'
import MeetingForm from './MeetingForm'
import Modal from '../../components/Modal'
import UserFilterSelect from '../../components/UserFilterSelect'
import styles from '../ListPage.module.css'

// byDateDesc: 日付の新しい順（降順）で並べるソート関数
const byDateDesc = (a: Meeting, b: Meeting) => b.date.localeCompare(a.date)

export default function MeetingList() {
  // 利用者一覧: フィルター選択肢の表示と userId→氏名変換に使う
  const [users] = useState<User[]>(() => getUsers())
  // useCrudListからフィルタ済みリスト・編集状態・各操作関数を取り出す
  const { filteredItems, editing, showForm, filterUserId, setFilterUserId, handleSave, handleEdit, handleNew, handleDelete, handleClose } =
    useCrudList<Meeting>({ fetchAll: getMeetings, deleteItem: deleteMeeting, sort: byDateDesc })

  return (
    <div>
      <div className={styles.toolbar}>
        {/* 利用者フィルター: 選択中の件数も表示する */}
        <UserFilterSelect users={users} value={filterUserId} onChange={setFilterUserId} count={filteredItems.length} />
        <button className={styles.btnPrimary} onClick={handleNew}>+ 会議追加</button>
      </div>

      {filteredItems.length === 0 ? (
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
              {/* filteredItems: 利用者フィルターが選択されている場合のみ絞り込んだ結果を表示する */}
              {filteredItems.map((m) => {
                // userId から利用者名を逆引きして表示する
                const user = users.find((u) => u.id === m.userId)
                return (
                  // 行クリックで編集モーダルを開く
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => handleEdit(m)}>
                    {/* ISO形式の日時文字列（例: "2024-01-15T10:00"）の T を空白に置換して読みやすくする */}
                    <td>{m.date.replace('T', ' ')}</td>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td>{m.location}</td>
                    <td className={styles.preWrap}>{m.participants}</td>
                    <td className={styles.preWrap}>{m.agenda}</td>
                    <td className={styles.preWrap}>{m.discussion}</td>
                    <td className={styles.preWrap}>{m.conclusion}</td>
                    <td className={styles.preWrap}>{m.futureTasks}</td>
                    {/* e.stopPropagation(): 操作ボタンのクリックが行全体のクリックに伝わらないようにする */}
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

      {/* editing が null なら新規追加モーダル、値があれば編集モーダルとして開く */}
      <Modal show={showForm} title={editing ? '担当者会議編集' : '担当者会議追加'} onClose={handleClose}>
        <MeetingForm meeting={editing} users={users} onSaved={handleSave} onCancel={handleClose} />
      </Modal>
    </div>
  )
}
