import { useState } from 'react'

interface Options<T> {
  fetchAll: () => T[]
  deleteItem: (id: string) => void
  sort?: (a: T, b: T) => number
}

export function useListPage<T extends { id: string; userId?: string }>({
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

  function handleSaved() {
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

  const filtered = filterUserId ? list.filter((item) => item.userId === filterUserId) : list

  return {
    list,
    filtered,
    editing,
    showForm,
    filterUserId,
    setFilterUserId,
    handleSaved,
    handleEdit,
    handleNew,
    handleDelete,
    handleClose,
  }
}
