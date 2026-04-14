/**
 * aiContext.ts — AIへ送るコンテキスト文字列を生成するユーティリティ
 * ローカルストレージの利用者・支援経過・ケアプランデータを整形してAIに渡す
 * データ量を抑えるため支援経過は最新20件、ケアプランは10件に絞っている
 */
import { getUsers, getProgressNotes, getCarePlans } from './storage'

// buildAISystemPrompt: AIへ渡すシステムコンテキスト文字列を生成する（旧名: buildContext）
// 命名変更の理由: 何を構築しているかが "buildAISystemPrompt" の方が明確
export function buildAISystemPrompt(): string {
  const users = getUsers()
  const notes = getProgressNotes().slice(0, 20)
  const plans = getCarePlans().slice(0, 10)
  const userSummary = users.map((u) => `・${u.name}（${u.careLevel}、担当: ${u.staffName}）`).join('\n')
  const noteSummary = notes.map((n) => {
    const user = users.find((u) => u.id === n.userId)
    return `[${n.date}] ${user?.name ?? '不明'}: ${n.content}`
  }).join('\n')
  const planSummary = plans.map((p) => {
    const user = users.find((u) => u.id === p.userId)
    return `${user?.name ?? '不明'}: 長期目標「${p.longTermGoal}」短期目標「${p.shortTermGoal}」`
  }).join('\n')
  return `【登録利用者】\n${userSummary}\n\n【最近の支援経過】\n${noteSummary}\n\n【ケアプラン】\n${planSummary}`
}
