import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const navItems = [
  { to: '/', label: 'ダッシュボード', icon: '🏠' },
  { to: '/users', label: '利用者管理', icon: '👥' },
  { to: '/care-plans', label: 'ケアプラン', icon: '📋' },
  { to: '/progress-notes', label: '支援経過', icon: '📝' },
  { to: '/monitoring', label: 'モニタリング', icon: '📊' },
  { to: '/meetings', label: '担当者会議', icon: '🤝' },
  { to: '/search', label: 'AI検索', icon: '🤖' },
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>♡</span>
        <span className={styles.logoText}>CareManager</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
