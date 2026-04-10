import { useParams, useNavigate } from 'react-router-dom'
import { getUsers, getCarePlans, getProgressNotes, getMonitoringList, getMeetings } from '../../utils/storage'
import { exportUserProfilePDF } from '../../utils/pdfUtils'
import styles from './UserProfile.module.css'

export default function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const user = getUsers().find((u) => u.id === id)
  if (!user) return <div style={{ padding: 24 }}>利用者が見つかりません。</div>

  const plans = getCarePlans().filter((p) => p.userId === id)
  const notes = getProgressNotes()
    .filter((n) => n.userId === id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const monitorings = getMonitoringList()
    .filter((m) => m.userId === id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const meetings = getMeetings()
    .filter((m) => m.userId === id)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
        <button className={styles.backBtn} onClick={() => navigate('/users')}>← 利用者一覧に戻る</button>
        <button className={styles.backBtn} onClick={() => exportUserProfilePDF(user, plans, notes, monitorings, meetings)} style={{ color: '#2563EB', borderColor: '#BFDBFE' }}>PDF出力</button>
      </div>

      {/* 基本情報 */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>{user.name[0]}</div>
          <div>
            <h1 className={styles.name}>{user.name}</h1>
            <p className={styles.kana}>{user.nameKana}</p>
            <span className={styles.careLevel}>{user.careLevel}</span>
          </div>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}><span className={styles.infoLabel}>生年月日</span><span>{user.birthDate}</span></div>
          <div className={styles.infoItem}><span className={styles.infoLabel}>性別</span><span>{user.gender === 'male' ? '男性' : '女性'}</span></div>
          <div className={styles.infoItem}><span className={styles.infoLabel}>電話番号</span><span>{user.phone}</span></div>
          <div className={styles.infoItem}><span className={styles.infoLabel}>担当者</span><span>{user.staffName}</span></div>
          <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}><span className={styles.infoLabel}>住所</span><span>{user.address}</span></div>
          <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}><span className={styles.infoLabel}>緊急連絡先</span><span>{user.emergencyContact}</span></div>
        </div>
      </div>

      <div className={styles.sections}>
        {/* ケアプラン */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 ケアプラン（{plans.length}件）</h2>
          {plans.length === 0 ? <p className={styles.empty}>登録なし</p> : plans.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardMeta}>{p.startDate} ～ {p.endDate}</div>
              <div className={styles.cardRow}><span className={styles.label}>長期目標</span><span>{p.longTermGoal}</span></div>
              <div className={styles.cardRow}><span className={styles.label}>短期目標</span><span>{p.shortTermGoal}</span></div>
              <div className={styles.cardRow}><span className={styles.label}>サービス内容</span><span>{p.services}</span></div>
            </div>
          ))}
        </section>

        {/* 支援経過 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📝 支援経過（{notes.length}件）</h2>
          {notes.length === 0 ? <p className={styles.empty}>登録なし</p> : notes.slice(0, 5).map((n) => (
            <div key={n.id} className={styles.card}>
              <div className={styles.cardMeta}>{n.date}　記録者：{n.author}</div>
              <p className={styles.cardText}>{n.content}</p>
            </div>
          ))}
        </section>

        {/* モニタリング */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📊 モニタリング（{monitorings.length}件）</h2>
          {monitorings.length === 0 ? <p className={styles.empty}>登録なし</p> : monitorings.slice(0, 3).map((m) => (
            <div key={m.id} className={styles.card}>
              <div className={styles.cardMeta}>{m.date}　記録者：{m.author}</div>
              <div className={styles.cardRow}><span className={styles.label}>身体状況</span><span>{m.physicalCondition}</span></div>
              <div className={styles.cardRow}><span className={styles.label}>精神状況</span><span>{m.mentalCondition}</span></div>
              <div className={styles.cardRow}><span className={styles.label}>課題</span><span>{m.issues || 'なし'}</span></div>
            </div>
          ))}
        </section>

        {/* 担当者会議 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🤝 担当者会議（{meetings.length}件）</h2>
          {meetings.length === 0 ? <p className={styles.empty}>登録なし</p> : meetings.slice(0, 3).map((m) => (
            <div key={m.id} className={styles.card}>
              <div className={styles.cardMeta}>{m.date.replace('T', ' ')}　{m.location}</div>
              <div className={styles.cardRow}><span className={styles.label}>議題</span><span>{m.agenda}</span></div>
              <div className={styles.cardRow}><span className={styles.label}>結論</span><span>{m.conclusion}</span></div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
