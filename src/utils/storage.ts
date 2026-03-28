import type { User, CarePlan, ProgressNote, Monitoring, Meeting } from '../types'
import { generateId } from './idUtils'

// Generic helpers
function getItems<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items))
}

// Keys
const KEYS = {
  users: 'care_users',
  carePlans: 'care_plans',
  progressNotes: 'care_progress_notes',
  monitoring: 'care_monitoring',
  meetings: 'care_meetings',
  seeded: 'care_seeded',
}

// ── Users ──────────────────────────────────────────────────────────────────
export function getUsers(): User[] {
  return getItems<User>(KEYS.users)
}

export function saveUser(user: User): void {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx >= 0) {
    users[idx] = user
  } else {
    users.push(user)
  }
  setItems(KEYS.users, users)
}

export function deleteUser(id: string): void {
  setItems(KEYS.users, getUsers().filter((u) => u.id !== id))
}

// ── CarePlans ──────────────────────────────────────────────────────────────
export function getCarePlans(): CarePlan[] {
  return getItems<CarePlan>(KEYS.carePlans)
}

export function saveCarePlan(plan: CarePlan): void {
  const plans = getCarePlans()
  const idx = plans.findIndex((p) => p.id === plan.id)
  if (idx >= 0) {
    plans[idx] = plan
  } else {
    plans.push(plan)
  }
  setItems(KEYS.carePlans, plans)
}

export function deleteCarePlan(id: string): void {
  setItems(KEYS.carePlans, getCarePlans().filter((p) => p.id !== id))
}

// ── ProgressNotes ──────────────────────────────────────────────────────────
export function getProgressNotes(): ProgressNote[] {
  return getItems<ProgressNote>(KEYS.progressNotes)
}

export function saveProgressNote(note: ProgressNote): void {
  const notes = getProgressNotes()
  const idx = notes.findIndex((n) => n.id === note.id)
  if (idx >= 0) {
    notes[idx] = note
  } else {
    notes.push(note)
  }
  setItems(KEYS.progressNotes, notes)
}

export function deleteProgressNote(id: string): void {
  setItems(KEYS.progressNotes, getProgressNotes().filter((n) => n.id !== id))
}

// ── Monitoring ─────────────────────────────────────────────────────────────
export function getMonitoringList(): Monitoring[] {
  return getItems<Monitoring>(KEYS.monitoring)
}

export function saveMonitoring(monitoring: Monitoring): void {
  const list = getMonitoringList()
  const idx = list.findIndex((m) => m.id === monitoring.id)
  if (idx >= 0) {
    list[idx] = monitoring
  } else {
    list.push(monitoring)
  }
  setItems(KEYS.monitoring, list)
}

export function deleteMonitoring(id: string): void {
  setItems(KEYS.monitoring, getMonitoringList().filter((m) => m.id !== id))
}

// ── Meetings ───────────────────────────────────────────────────────────────
export function getMeetings(): Meeting[] {
  return getItems<Meeting>(KEYS.meetings)
}

export function saveMeeting(meeting: Meeting): void {
  const meetings = getMeetings()
  const idx = meetings.findIndex((m) => m.id === meeting.id)
  if (idx >= 0) {
    meetings[idx] = meeting
  } else {
    meetings.push(meeting)
  }
  setItems(KEYS.meetings, meetings)
}

export function deleteMeeting(id: string): void {
  setItems(KEYS.meetings, getMeetings().filter((m) => m.id !== id))
}

// ── Seed Data ──────────────────────────────────────────────────────────────
export function seedIfNeeded(): void {
  if (localStorage.getItem(KEYS.seeded)) return

  const user1Id = generateId()
  const user2Id = generateId()
  const user3Id = generateId()

  const users: User[] = [
    {
      id: user1Id,
      name: '山田 花子',
      nameKana: 'ヤマダ ハナコ',
      birthDate: '1940-05-15',
      gender: 'female',
      careLevel: '要介護2',
      address: '東京都新宿区西新宿1-1-1',
      phone: '03-1234-5678',
      emergencyContact: '山田 太郎（息子）090-1234-5678',
      staffName: '田中 美咲',
      createdAt: new Date().toISOString(),
    },
    {
      id: user2Id,
      name: '鈴木 一郎',
      nameKana: 'スズキ イチロウ',
      birthDate: '1935-11-03',
      gender: 'male',
      careLevel: '要介護3',
      address: '東京都渋谷区渋谷2-2-2',
      phone: '03-9876-5432',
      emergencyContact: '鈴木 京子（妻）090-9876-5432',
      staffName: '佐藤 健太',
      createdAt: new Date().toISOString(),
    },
    {
      id: user3Id,
      name: '佐々木 幸子',
      nameKana: 'ササキ サチコ',
      birthDate: '1945-03-22',
      gender: 'female',
      careLevel: '要支援2',
      address: '東京都港区南青山3-3-3',
      phone: '03-5555-1234',
      emergencyContact: '佐々木 明（長男）080-5555-1234',
      staffName: '田中 美咲',
      createdAt: new Date().toISOString(),
    },
  ]

  const carePlans: CarePlan[] = [
    {
      id: generateId(),
      userId: user1Id,
      longTermGoal: '自宅での生活を継続し、家族との交流を楽しむ',
      shortTermGoal: '週3回のデイサービス参加で身体機能を維持する',
      services: '訪問介護（週2回）、デイサービス（週3回）、訪問看護（月2回）',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user2Id,
      longTermGoal: '介護負担を軽減しながら安心して在宅生活を送る',
      shortTermGoal: '転倒防止のための環境整備と筋力維持',
      services: '訪問介護（週3回）、福祉用具貸与、訪問リハビリ（週1回）',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      createdAt: new Date().toISOString(),
    },
  ]

  const progressNotes: ProgressNote[] = [
    {
      id: generateId(),
      userId: user1Id,
      date: '2024-12-01',
      author: '田中 美咲',
      content: 'デイサービス参加。体調良好。入浴介助・食事介助実施。食欲あり、完食。笑顔で他利用者と会話を楽しんでいた。',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user2Id,
      date: '2024-12-02',
      author: '佐藤 健太',
      content: '訪問介護実施。若干倦怠感あり。血圧138/82mmHg。水分摂取を促した。排泄介助、更衣介助実施。',
      createdAt: new Date().toISOString(),
    },
  ]

  const monitoring: Monitoring[] = [
    {
      id: generateId(),
      userId: user1Id,
      date: '2024-12-15',
      author: '田中 美咲',
      physicalCondition: '体重維持。食欲良好。睡眠は概ね良好。',
      mentalCondition: '穏やか。意欲的に活動参加。',
      serviceStatus: 'デイサービス・訪問介護ともに計画通り利用できている。',
      issues: '特になし',
      createdAt: new Date().toISOString(),
    },
  ]

  const meetings: Meeting[] = [
    {
      id: generateId(),
      userId: user1Id,
      date: '2024-12-10T14:00',
      location: '山田様宅',
      participants: '山田花子様、山田太郎様（息子）、田中美咲（CM）、デイサービス担当者',
      agenda: '現在のサービス内容の確認、今後の方針について',
      minutes: 'サービス内容に満足している旨を確認。息子より「最近よく笑うようになった」との報告あり。来年度も同様のプランで継続することを確認。',
      createdAt: new Date().toISOString(),
    },
  ]

  users.forEach(saveUser)
  carePlans.forEach(saveCarePlan)
  progressNotes.forEach(saveProgressNote)
  monitoring.forEach(saveMonitoring)
  meetings.forEach(saveMeeting)

  localStorage.setItem(KEYS.seeded, 'true')
}
