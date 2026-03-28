import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import styles from './Layout.module.css'

const PAGE_TITLES: Record<string, string> = {
  '/': 'ダッシュボード',
  '/users': '利用者管理',
  '/users/new': '利用者追加',
  '/care-plans': 'ケアプラン',
  '/progress-notes': '支援経過',
  '/monitoring': 'モニタリング',
  '/meetings': '担当者会議',
  '/search': 'AI検索',
}

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/users/')) return '利用者詳細'
  if (pathname.startsWith('/care-plans/')) return 'ケアプラン'
  if (pathname.startsWith('/progress-notes/')) return '支援経過'
  if (pathname.startsWith('/monitoring/')) return 'モニタリング'
  if (pathname.startsWith('/meetings/')) return '担当者会議'
  return 'CareManager'
}

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.main}>
        <Header title={getTitle(pathname)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
