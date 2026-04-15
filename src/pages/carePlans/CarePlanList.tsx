/**
 * CarePlanList.tsx — ケアプラン一覧ページ
 * 利用者フィルタ・一覧表示・追加・編集・削除・Excel/PDF エクスポートを行う
 */
import { useState } from 'react'
import type { CarePlan, User } from '../../types'
import { getCarePlans, deleteCarePlan, getUsers } from '../../utils/storage'
import { exportCarePlans } from '../../utils/excelUtils'
import { exportCarePlansPDF } from '../../utils/pdfUtils'
// useCrudList: 一覧表示に必要な状態管理・操作をまとめたカスタムフック（旧: useListPage）
import { useCrudList } from '../../hooks/useCrudList'
import CarePlanForm from './CarePlanForm'
import Modal from '../../components/Modal'
import UserFilterSelect from '../../components/UserFilterSelect'
import styles from '../ListPage.module.css'

export default function CarePlanList() {
  // 利用者一覧: フィルター選択肢の表示と userId→氏名変換に使う
  const [users] = useState<User[]>(() => getUsers())
  // useCrudListからフィルタ済みリスト・編集状態・各操作関数を取り出す
  const { filteredItems, editing, showForm, filterUserId, setFilterUserId, handleSave, handleEdit, handleNew, handleDelete, handleClose } =
    useCrudList<CarePlan>({ fetchAll: getCarePlans, deleteItem: deleteCarePlan })

  return (
    <div>
      <div className={styles.toolbar}>
        {/* 利用者フィルター: 選択中の件数も表示する */}
        <UserFilterSelect users={users} value={filterUserId} onChange={setFilterUserId} count={filteredItems.length} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.btnEdit} onClick={() => exportCarePlans()}>Excelエクスポート</button>
          {/* PDFエクスポート: フィルタ後のデータを印刷対象にする */}
          <button className={styles.btnEdit} onClick={() => exportCarePlansPDF(filteredItems, users)}>PDFエクスポート</button>
          <button className={styles.btnPrimary} onClick={handleNew}>+ ケアプラン追加</button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
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
              {/* filteredItems: 利用者フィルターが選択されている場合のみ絞り込んだ結果を表示する */}
              {filteredItems.map((p) => {
                // userId から利用者名を逆引きして表示する
                const user = users.find((u) => u.id === p.userId)
                return (
                  // 行クリックで編集モーダルを開く
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => handleEdit(p)}>
                    <td className={styles.bold}>{user?.name ?? '—'}</td>
                    <td className={styles.preWrap}>{p.longTermGoal}</td>
                    <td className={styles.preWrap}>{p.shortTermGoal}</td>
                    <td className={styles.preWrap}>{p.services}</td>
                    <td>{p.startDate}</td>
                    <td>{p.endDate}</td>
                    {/* e.stopPropagation(): 操作ボタンのクリックが行全体のクリックに伝わらないようにする */}
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

      {/* editing が null なら新規追加モーダル、値があれば編集モーダルとして開く */}
      <Modal show={showForm} title={editing ? 'ケアプラン編集' : 'ケアプラン追加'} onClose={handleClose}>
        <CarePlanForm plan={editing} users={users} onSaved={handleSave} onCancel={handleClose} />
      </Modal>
    </div>
  )
}
