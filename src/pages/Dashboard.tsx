/**
 * Dashboard.tsx — トップページのダッシュボードコンポーネント
 * 統計サマリー・アラート（モニタリング未実施・ケアプラン期限切れ）・グラフを表示する
 * recharts の PieChart（介護度分布）と BarChart（担当者別利用者数）を使用
 * cx="50%" cy="50%" はグラフの中心座標をコンテナサイズの50%に指定している
 * dataKey はグラフが参照するデータのプロパティ名、nameKey は凡例に表示するプロパティ名
 */
import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { getUsers, getCarePlans, getProgressNotes, getMeetings, getMonitoringList } from '../utils/storage'
import styles from './Dashboard.module.css'

const COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#7C3AED', '#DB2777']

export default function Dashboard() {
  const [users] = useState(() => getUsers())
  const [carePlans] = useState(() => getCarePlans())
  const [progressNotes] = useState(() => getProgressNotes())
  const [meetings] = useState(() => getMeetings())
  const [monitorings] = useState(() => getMonitoringList())

  const today = new Date()

  // アラート計算
  const alerts: { type: 'error' | 'warning'; message: string }[] = []

  // モニタリング未実施（30日超過）
  users.forEach((u) => {
    const userMonitorings = monitorings.filter((m) => m.userId === u.id)
    if (userMonitorings.length === 0) {
      alerts.push({ type: 'warning', message: `${u.name}さん：モニタリングが未実施です` })
    } else {
      const latest = userMonitorings.sort((a, b) => b.date.localeCompare(a.date))[0]
      const daysDiff = Math.floor((today.getTime() - new Date(latest.date).getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff > 30) {
        alerts.push({ type: 'warning', message: `${u.name}さん：モニタリング未実施（${daysDiff}日経過）` })
      }
    }
  })

  // ケアプラン期限切れ
  carePlans.forEach((p) => {
    const user = users.find((u) => u.id === p.userId)
    if (p.endDate && new Date(p.endDate) < today) {
      alerts.push({ type: 'error', message: `${user?.name ?? '不明'}さん：ケアプランの有効期限が切れています（${p.endDate}）` })
    }
  })

  const stats = [
    { label: '利用者数', value: users.length, unit: '名', color: '#2563EB' },
    { label: 'ケアプラン', value: carePlans.length, unit: '件', color: '#0891B2' },
    { label: '支援経過', value: progressNotes.length, unit: '件', color: '#059669' },
    { label: '担当者会議', value: meetings.length, unit: '件', color: '#D97706' },
  ]

  const recentNotes = [...progressNotes]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // グラフデータ：介護度分布
  const careLevelMap: Record<string, number> = {}
  users.forEach((u) => {
    careLevelMap[u.careLevel] = (careLevelMap[u.careLevel] ?? 0) + 1
  })
  const pieData = Object.entries(careLevelMap).map(([name, value]) => ({ name, value }))

  // グラフデータ：担当者別利用者数
  const staffMap: Record<string, number> = {}
  users.forEach((u) => {
    staffMap[u.staffName] = (staffMap[u.staffName] ?? 0) + 1
  })
  const barData = Object.entries(staffMap).map(([name, count]) => ({ name, count }))

  return (
    <div className={styles.page}>
      {/* アラートセクション */}
      {alerts.length > 0 && (
        <div className={styles.alertSection}>
          <h2 className={styles.alertTitle}>⚠️ 要確認事項（{alerts.length}件）</h2>
          {alerts.map((a, i) => (
            <div key={i} className={`${styles.alertItem} ${a.type === 'error' ? styles.alertError : styles.alertWarning}`}>
              {a.type === 'error' ? '🔴' : '🟡'} {a.message}
            </div>
          ))}
        </div>
      )}

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard} style={{ borderTopColor: s.color }}>
            <div className={styles.statValue} style={{ color: s.color }}>
              {s.value}<span className={styles.statUnit}>{s.unit}</span>
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.row}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>最近の支援経過</h2>
          {recentNotes.length === 0 ? (
            <p className={styles.empty}>記録がありません</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>日付</th><th>利用者</th><th>記録者</th><th>内容</th></tr>
              </thead>
              <tbody>
                {recentNotes.map((note) => {
                  const user = users.find((u) => u.id === note.userId)
                  return (
                    <tr key={note.id}>
                      <td>{note.date}</td>
                      <td>{user?.name ?? '—'}</td>
                      <td>{note.author}</td>
                      <td className={styles.truncate}>{note.content}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.sideCards}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>利用者一覧</h2>
            {users.length === 0 ? (
              <p className={styles.empty}>利用者がいません</p>
            ) : (
              <ul className={styles.userList}>
                {users.map((u) => (
                  <li key={u.id} className={styles.userItem}>
                    <span className={styles.userName}>{u.name}</span>
                    <span className={styles.careLevel}>{u.careLevel}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* グラフセクション */}
      <div className={styles.chartsRow}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>介護度分布</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}名`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>担当者別利用者数</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="利用者数" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
