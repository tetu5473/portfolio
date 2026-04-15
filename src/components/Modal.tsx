/**
 * Modal.tsx — 汎用モーダルコンポーネント
 * show=true のときにオーバーレイとダイアログを表示する。オーバーレイクリックで閉じる。
 */
import type { ReactNode } from 'react'
import styles from '../pages/ListPage.module.css'

interface ModalProps {
  show: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ show, title, onClose, children }: ModalProps) {
  if (!show) return null
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
