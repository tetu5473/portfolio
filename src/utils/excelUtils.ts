import * as XLSX from 'xlsx'
import type { User, CarePlan, ProgressNote } from '../types'
import {
  getUsers,
  getCarePlans,
  getProgressNotes,
  saveUser,
  saveCarePlan,
  saveProgressNote,
} from './storage'
import { generateId } from './idUtils'

// ── Export ───────────────────────────────────────────────────────────────────

export function exportUsers(): void {
  const users = getUsers()
  const rows = users.map((u) => ({
    ID: u.id,
    氏名: u.name,
    ふりがな: u.nameKana,
    生年月日: u.birthDate,
    性別: u.gender === 'male' ? '男性' : '女性',
    介護度: u.careLevel,
    住所: u.address,
    電話番号: u.phone,
    緊急連絡先: u.emergencyContact,
    担当者: u.staffName,
    登録日時: u.createdAt,
  }))
  downloadSheet(rows, '利用者一覧', '利用者一覧.xlsx')
}

export function exportCarePlans(): void {
  const plans = getCarePlans()
  const users = getUsers()
  const rows = plans.map((p) => {
    const user = users.find((u) => u.id === p.userId)
    return {
      ID: p.id,
      利用者ID: p.userId,
      利用者名: user?.name ?? '',
      長期目標: p.longTermGoal,
      短期目標: p.shortTermGoal,
      サービス内容: p.services,
      開始日: p.startDate,
      終了日: p.endDate,
      登録日時: p.createdAt,
    }
  })
  downloadSheet(rows, 'ケアプラン', 'ケアプラン一覧.xlsx')
}

export function exportProgressNotes(): void {
  const notes = getProgressNotes()
  const users = getUsers()
  const rows = notes.map((n) => {
    const user = users.find((u) => u.id === n.userId)
    return {
      ID: n.id,
      利用者ID: n.userId,
      利用者名: user?.name ?? '',
      日付: n.date,
      記録者: n.author,
      内容: n.content,
      登録日時: n.createdAt,
    }
  })
  downloadSheet(rows, '支援経過', '支援経過一覧.xlsx')
}

function downloadSheet(rows: Record<string, string>[], sheetName: string, fileName: string): void {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, fileName)
}

// ── Import ────────────────────────────────────────────────────────────────────

export function importUsers(file: File): Promise<{ count: number; errors: string[] }> {
  return readSheet(file).then(({ data, errors }) => {
    let count = 0
    for (const row of data) {
      const r = row as Record<string, string>
      const careLevel = r['介護度'] as User['careLevel']
      const validLevels: User['careLevel'][] = [
        '要支援1', '要支援2', '要介護1', '要介護2', '要介護3', '要介護4', '要介護5',
      ]
      if (!r['氏名']) {
        errors.push(`氏名が空の行をスキップしました`)
        continue
      }
      if (!validLevels.includes(careLevel)) {
        errors.push(`不明な介護度「${r['介護度']}」をスキップしました（氏名: ${r['氏名']}）`)
        continue
      }
      const user: User = {
        id: r['ID'] || generateId(),
        name: r['氏名'] ?? '',
        nameKana: r['ふりがな'] ?? '',
        birthDate: r['生年月日'] ?? '',
        gender: r['性別'] === '男性' ? 'male' : 'female',
        careLevel,
        address: r['住所'] ?? '',
        phone: r['電話番号'] ?? '',
        emergencyContact: r['緊急連絡先'] ?? '',
        staffName: r['担当者'] ?? '',
        createdAt: r['登録日時'] || new Date().toISOString(),
      }
      saveUser(user)
      count++
    }
    return { count, errors }
  })
}

export function importCarePlans(file: File): Promise<{ count: number; errors: string[] }> {
  return readSheet(file).then(({ data, errors }) => {
    let count = 0
    for (const row of data) {
      const r = row as Record<string, string>
      if (!r['利用者ID']) {
        errors.push(`利用者IDが空の行をスキップしました`)
        continue
      }
      const plan: CarePlan = {
        id: r['ID'] || generateId(),
        userId: r['利用者ID'],
        longTermGoal: r['長期目標'] ?? '',
        shortTermGoal: r['短期目標'] ?? '',
        services: r['サービス内容'] ?? '',
        startDate: r['開始日'] ?? '',
        endDate: r['終了日'] ?? '',
        createdAt: r['登録日時'] || new Date().toISOString(),
      }
      saveCarePlan(plan)
      count++
    }
    return { count, errors }
  })
}

export function importProgressNotes(file: File): Promise<{ count: number; errors: string[] }> {
  return readSheet(file).then(({ data, errors }) => {
    let count = 0
    for (const row of data) {
      const r = row as Record<string, string>
      if (!r['利用者ID']) {
        errors.push(`利用者IDが空の行をスキップしました`)
        continue
      }
      const note: ProgressNote = {
        id: r['ID'] || generateId(),
        userId: r['利用者ID'],
        date: r['日付'] ?? '',
        author: r['記録者'] ?? '',
        content: r['内容'] ?? '',
        createdAt: r['登録日時'] || new Date().toISOString(),
      }
      saveProgressNote(note)
      count++
    }
    return { count, errors }
  })
}

function readSheet(file: File): Promise<{ data: Record<string, string>[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const wb = XLSX.read(data, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
        resolve({ data: rows, errors: [] })
      } catch {
        resolve({ data: [], errors: ['ファイルの読み込みに失敗しました'] })
      }
    }
    reader.readAsBinaryString(file)
  })
}
