/**
 * useCrudList — 一覧ページ共通のロジックをまとめたカスタムフック
 * 新規作成・編集・削除・フィルタリングの状態管理を提供する
 *
 * 旧名称: useListPage（講師レビューを受けて useCrudList に改名）
 * 命名変更の理由: "Crud" の方が「作成・更新・削除操作を持つ一覧」という意図が伝わりやすいため
 */
import { useState } from 'react'

interface Options<T> {
  fetchAll: () => T[]
  deleteItem: (id: string) => void
  sort?: (a: T, b: T) => number
}

// ジェネリクスの制約 T extends { id: string; userId?: string } の意味:
// T は必ず id プロパティ（string）を持つ型でなければならない → 削除・編集に id が必要なため
// userId は省略可能（?）にしているのは、userId を持たない型でも使えるようにするため
// これにより利用者・ケアプラン・支援経過など異なる型を同じフックで扱える
export function useCrudList<T extends { id: string; userId?: string }>({
  fetchAll,
  deleteItem,
  sort,
}: Options<T>) {
  const sorted = (items: T[]) => (sort ? [...items].sort(sort) : items)

  const [list, setList] = useState<T[]>(() => sorted(fetchAll()))
  const [editing, setEditing] = useState<T | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterUserId, setFilterUserId] = useState('')

  function refresh() {
    setList(sorted(fetchAll()))
  }

  // handleSave: フォームの保存完了後に呼ばれる（旧名: handleSaved）
  // 一覧を再取得してモーダルを閉じる
  function handleSave() {
    refresh()
    setShowForm(false)
    setEditing(null)
  }

  function handleEdit(item: T) {
    setEditing(item)
    setShowForm(true)
  }

  function handleNew() {
    setEditing(null)
    setShowForm(true)
  }

  function handleDelete(id: string, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return
    deleteItem(id)
    refresh()
  }

  function handleClose() {
    setShowForm(false)
    setEditing(null)
  }

  // filteredItems: filterUserId が選択されている場合のみ絞り込んだリストを返す（旧名: filtered）
  // 名前に "Items" を付けることで「何のリストか」が明確になる
  const filteredItems = filterUserId ? list.filter((item) => item.userId === filterUserId) : list

  return {
    list,
    filteredItems,
    editing,
    showForm,
    filterUserId,
    setFilterUserId,
    handleSave,
    handleEdit,
    handleNew,
    handleDelete,
    handleClose,
  }
}
