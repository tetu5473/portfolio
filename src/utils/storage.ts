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
  seeded: 'care_seeded_v6',
}

// ── Generic CRUD ───────────────────────────────────────────────────────────
function saveItem<T extends { id: string }>(key: string, item: T): void {
  const items = getItems<T>(key)
  const idx = items.findIndex((x) => x.id === item.id)
  if (idx >= 0) {
    items[idx] = item
  } else {
    items.push(item)
  }
  setItems(key, items)
}

// ── Users ──────────────────────────────────────────────────────────────────
export function getUsers(): User[] { return getItems<User>(KEYS.users) }
export function saveUser(user: User): void { saveItem(KEYS.users, user) }
export function deleteUser(id: string): void { setItems(KEYS.users, getUsers().filter((u) => u.id !== id)) }

// ── CarePlans ──────────────────────────────────────────────────────────────
export function getCarePlans(): CarePlan[] { return getItems<CarePlan>(KEYS.carePlans) }
export function saveCarePlan(plan: CarePlan): void { saveItem(KEYS.carePlans, plan) }
export function deleteCarePlan(id: string): void { setItems(KEYS.carePlans, getCarePlans().filter((p) => p.id !== id)) }

// ── ProgressNotes ──────────────────────────────────────────────────────────
export function getProgressNotes(): ProgressNote[] { return getItems<ProgressNote>(KEYS.progressNotes) }
export function saveProgressNote(note: ProgressNote): void { saveItem(KEYS.progressNotes, note) }
export function deleteProgressNote(id: string): void { setItems(KEYS.progressNotes, getProgressNotes().filter((n) => n.id !== id)) }

// ── Monitoring ─────────────────────────────────────────────────────────────
export function getMonitoringList(): Monitoring[] { return getItems<Monitoring>(KEYS.monitoring) }
export function saveMonitoring(monitoring: Monitoring): void { saveItem(KEYS.monitoring, monitoring) }
export function deleteMonitoring(id: string): void { setItems(KEYS.monitoring, getMonitoringList().filter((m) => m.id !== id)) }

// ── Meetings ───────────────────────────────────────────────────────────────
export function getMeetings(): Meeting[] { return getItems<Meeting>(KEYS.meetings) }
export function saveMeeting(meeting: Meeting): void { saveItem(KEYS.meetings, meeting) }
export function deleteMeeting(id: string): void { setItems(KEYS.meetings, getMeetings().filter((m) => m.id !== id)) }

// ── Seed Data ──────────────────────────────────────────────────────────────
export function seedIfNeeded(): void {
  if (localStorage.getItem(KEYS.seeded)) return

  // 旧バージョンのデータをクリア
  localStorage.removeItem('care_seeded')
  localStorage.removeItem('care_seeded_v2')
  localStorage.removeItem('care_seeded_v3')
  localStorage.removeItem('care_seeded_v4')
  localStorage.removeItem('care_seeded_v5')
  localStorage.removeItem(KEYS.users)
  localStorage.removeItem(KEYS.carePlans)
  localStorage.removeItem(KEYS.progressNotes)
  localStorage.removeItem(KEYS.monitoring)
  localStorage.removeItem(KEYS.meetings)

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
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user2Id,
      longTermGoal: '介護負担を軽減しながら安心して在宅生活を送る',
      shortTermGoal: '転倒防止のための環境整備と筋力維持',
      services: '訪問介護（週3回）、福祉用具貸与、訪問リハビリ（週1回）',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user3Id,
      longTermGoal: '地域とのつながりを保ちながら、自立した生活を継続する',
      shortTermGoal: '膝関節痛の改善と筋力維持により、屋外歩行を安全に行う',
      services: '訪問介護（週1回）、訪問リハビリ（週1回）、福祉用具貸与',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      createdAt: new Date().toISOString(),
    },
  ]

  const progressNotes: ProgressNote[] = [
    {
      id: generateId(),
      userId: user1Id,
      date: '2026-01-15',
      author: '田中 美咲',
      content: 'デイサービス参加。体調良好。入浴介助・食事介助実施。食欲あり、完食。笑顔で他利用者と会話を楽しんでいた。レクリエーションにも積極的に参加し、折り紙を楽しんでいた。',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user2Id,
      date: '2026-01-20',
      author: '佐藤 健太',
      content: '訪問介護実施。血圧138/82mmHg、脈拍72回/分。倦怠感の訴えあり、水分摂取を促した。排泄介助・更衣介助実施。室内の手すり使用状況を確認、問題なく活用できている。',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user3Id,
      date: '2026-01-22',
      author: '田中 美咲',
      content: '訪問介護実施。体調良好。買い物同行支援を実施し、自ら商品を選ぶ場面も見られた。膝の痛みは軽減傾向にあるとのこと。リハビリへの意欲も高く、自主訓練を継続している。',
      createdAt: new Date().toISOString(),
    },
  ]

  const monitoring: Monitoring[] = [
    {
      id: generateId(),
      userId: user1Id,
      date: '2026-02-15',
      author: '田中 美咲',
      physicalCondition: '体重維持（48kg）。食欲良好。睡眠は概ね良好だが、夜間トイレ回数が増加傾向。',
      mentalCondition: '穏やか。デイサービスでの交流を楽しみにしている。意欲的に活動参加。',
      serviceStatus: 'デイサービス・訪問介護ともに計画通り利用できている。訪問看護では血圧管理を継続中。',
      issues: '夜間トイレ回数増加のため、転倒リスクに注意が必要。足元の照明設置を家族に提案済み。',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user2Id,
      date: '2026-02-18',
      author: '佐藤 健太',
      physicalCondition: '体重60kg（前月比-1kg）。食欲やや低下。下肢筋力は維持されている。',
      mentalCondition: '妻の体調不良を心配しており、やや不安な様子。会話は明瞭で認知機能に変化なし。',
      serviceStatus: '訪問介護・訪問リハビリともに計画通り実施。福祉用具（歩行器）を適切に使用できている。',
      issues: '妻の介護負担増大のリスクあり。家族支援の観点からも引き続きモニタリングが必要。',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user3Id,
      date: '2026-02-20',
      author: '田中 美咲',
      physicalCondition: '体重52kg。膝関節痛は軽減傾向。歩行状態は安定しており、屋内は杖なしで歩行可能。',
      mentalCondition: '明るく前向き。地域の体操教室への参加を希望しており、意欲が高い。',
      serviceStatus: '訪問介護（週1回）は本人の希望により買い物支援中心に実施。サービスへの満足度高い。',
      issues: '特になし。体操教室への参加に向けて地域情報を収集中。',
      createdAt: new Date().toISOString(),
    },
  ]

  const meetings: Meeting[] = [
    {
      id: generateId(),
      userId: user1Id,
      date: '2026-03-10T14:00',
      location: '山田様宅',
      participants: '山田花子様、山田太郎様（息子）、田中美咲（CM）、デイサービス担当者、訪問看護師',
      agenda: '現在のサービス内容の確認、夜間の転倒リスク対策について',
      discussion: '夜間トイレ時の転倒リスクについて各担当者から意見を出し合った。訪問看護師より夜間の排尿回数増加が確認されており、足元の安全確保が急務との意見が出た。デイサービス担当者からは日中の水分補給管理の提案があった。',
      conclusion: '足元センサーライトを寝室とトイレの導線に設置することを決定。来年度も現行サービス内容で継続する。日中の水分補給はデイサービスで引き続き促す。',
      futureTasks: '息子によるセンサーライト設置（2026年3月末まで）。設置後の転倒リスク再評価を次回モニタリング時に実施。夜間排尿回数の変化を訪問看護で継続観察。',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user2Id,
      date: '2026-03-12T10:00',
      location: '鈴木様宅',
      participants: '鈴木一郎様、鈴木京子様（妻）、佐藤健太（CM）、訪問リハビリ担当者',
      agenda: '妻の介護負担軽減策の検討、リハビリの進捗確認',
      discussion: '妻の体調不良が続いており、日常的な介護負担が増大していることを全員で共有。訪問リハビリ担当者よりリハビリの進捗として歩行距離の増加が報告された。CMよりショートステイ活用の提案を行い、本人・妻双方に説明した。',
      conclusion: 'ショートステイを月1〜2回活用する方向で前向きに検討することを確認。リハビリは現行内容で継続。妻の負担軽減を最優先に今後の支援を組み立てる。',
      futureTasks: 'ショートステイ施設の情報収集・見学調整（CM担当）。妻の体調状況を次回訪問時に再確認。リハビリの歩行目標距離を次回設定する。',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: user3Id,
      date: '2026-03-15T13:00',
      location: 'デイサービスセンター会議室',
      participants: '佐々木幸子様、佐々木明様（長男）、田中美咲（CM）、訪問介護員',
      agenda: 'サービス利用状況の確認、今後の支援方針について',
      discussion: '膝関節痛の軽減により屋内歩行が安定し、活動範囲が広がっていることを確認。本人より地域の体操教室への参加希望が出され、長男も賛成。訪問介護員より買い物同行時の自立度が高まっているとの報告があった。',
      conclusion: '訪問介護の頻度は現状維持（週1回）とし、自立支援を継続する方針を確認。地域の体操教室への参加に向けてCMが情報収集・同行支援を行う。',
      futureTasks: '地域体操教室の日程・参加条件をCMが確認し、本人・長男に情報提供（4月中）。次回モニタリング時に体操教室参加状況を評価する。屋外歩行の安全性確認を訪問介護時に継続する。',
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
