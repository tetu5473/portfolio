import { getUsers, getProgressNotes, getCarePlans, getMonitoringList, getMeetings } from './storage'

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateMockReply(userQuery: string): string {
  const q = userQuery
  const ql = q.toLowerCase()
  const users = getUsers()
  const notes = getProgressNotes()
  const plans = getCarePlans()
  const monitorings = getMonitoringList()
  const meetings = getMeetings()

  // 利用者名マッチング（スペースあり・なし両方に対応）
  const matchedUser = users.find((u) => {
    const nameNoSpace = u.name.replace(/\s/g, '')
    return q.includes(u.name) || q.includes(nameNoSpace)
  })

  // -------------------------------------------------------
  // 文章作成・文章生成系（最優先）
  // -------------------------------------------------------
  const isWriteRequest =
    q.includes('文章') || q.includes('作成して') || q.includes('書いて') ||
    q.includes('作って') || q.includes('文を') || q.includes('文にして') ||
    q.includes('文字程度') || q.includes('文字くらい') || q.includes('記録して') ||
    q.includes('まとめて') || q.includes('例文')

  if (isWriteRequest) {
    // 文字数指定を抽出
    const charMatch = q.match(/(\d+)文字/)
    const targetChars = charMatch ? parseInt(charMatch[1]) : 100

    // 入力文から素材を抽出（「上記の言葉を含めて」パターン）
    const sourceText = q.split(/上記|それを|これを|以下/)[0].trim()

    // 支援経過・記録系
    if (q.includes('支援経過') || q.includes('経過記録') || q.includes('記録')) {
      return generateProgressNote(sourceText, targetChars, matchedUser?.name)
    }
    // ケアプラン系
    if (q.includes('ケアプラン') || q.includes('目標')) {
      return generateCarePlanText(sourceText, targetChars)
    }
    // モニタリング系
    if (q.includes('モニタリング')) {
      return generateMonitoringText(sourceText, targetChars)
    }
    // 議事録系
    if (q.includes('議事録') || q.includes('会議')) {
      return generateMeetingText(sourceText, targetChars)
    }
    // 汎用文章生成
    return generateGenericNote(sourceText, targetChars)
  }

  // -------------------------------------------------------
  // 支援経過の要約
  // -------------------------------------------------------
  if (q.includes('支援経過') && (q.includes('要約') || q.includes('教えて') || q.includes('確認'))) {
    if (matchedUser) {
      const userNotes = notes.filter((n) => n.userId === matchedUser.id)
      if (userNotes.length === 0) {
        return `${matchedUser.name}さんの支援経過記録はまだ登録されていません。`
      }
      const recent = userNotes.slice(-3)
      const summary = recent.map((n) => `・${n.date}：${n.content}`).join('\n')
      return `${matchedUser.name}さん（${matchedUser.careLevel}）の最近の支援経過です。\n\n${summary}\n\n全体的に安定した経過をたどっています。引き続き定期的なモニタリングを継続してください。`
    }
    const recent = notes.slice(-5)
    if (recent.length === 0) return '支援経過の記録がまだありません。'
    return `最近の支援経過（${recent.length}件）:\n\n` + recent.map((n: { date: string; userId: string; content: string }) => {
      const u = users.find((u) => u.id === n.userId)
      return `・[${n.date}] ${u?.name ?? '不明'}：${n.content}`
    }).join('\n')
  }

  // -------------------------------------------------------
  // ケアプラン文言生成
  // -------------------------------------------------------
  if (q.includes('ケアプラン') && (q.includes('文言') || q.includes('生成') || q.includes('例'))) {
    if (q.includes('転倒')) {
      return `転倒リスクが高い利用者向けのケアプラン文言例です。\n\n【長期目標】\n安全な環境の中で転倒なく日常生活を送ることができる\n\n【短期目標】\nベッドからの起き上がり・移乗動作を安全に行うことができる\n\n【サービス内容】\n・居室内の環境整備（手すり設置・床の障害物除去）\n・移乗介助時の見守り・一部介助\n・転倒リスクのアセスメントと定期的な見直し\n・家族への転倒予防指導`
    }
    if (q.includes('認知症')) {
      return `認知症の方向けのケアプラン文言例です。\n\n【長期目標】\n認知症の進行を緩やかにし、穏やかな生活を送ることができる\n\n【短期目標】\n日常的な習慣を維持しながら安心して過ごすことができる\n\n【サービス内容】\n・回想法・レクリエーションの実施\n・生活リズムの維持（起床・食事・就寝時間の統一）\n・見当識障害への対応（日付・場所の声かけ）\n・家族への介護方法の助言・指導`
    }
    return `ケアプラン文言の例を提示します。\n\n【長期目標】\n自宅での生活を継続しながら、心身ともに安定した生活を送ることができる\n\n【短期目標】\n必要なサービスを利用しながら、ADLの維持・向上を図ることができる\n\n【サービス内容】\n・定期的な訪問介護による生活援助\n・状態変化の早期発見と適切な対応\n・家族との連携による在宅生活の支援`
  }

  // -------------------------------------------------------
  // 支援経過の書き方
  // -------------------------------------------------------
  if (q.includes('支援経過') && (q.includes('書き方') || q.includes('ポイント'))) {
    return `支援経過の書き方のポイントです。\n\n【基本構成】\n①日時・記録者\n②利用者の状態（身体・精神・生活）\n③実施したサービス内容\n④利用者・家族の反応\n⑤今後の課題・対応方針\n\n【認知症の方の場合の追加ポイント】\n・表情・言動を具体的に記録する\n・混乱や不安の有無を記載する\n・コミュニケーション方法の工夫を記録する\n・前回との比較を意識して変化を記載する\n\n【注意点】\n主観的な表現より客観的な事実を記録することが重要です。「〜のようだった」より「〜と発言した」「〜の様子が見られた」という表現を心がけましょう。`
  }

  // -------------------------------------------------------
  // 担当者会議・議事録テンプレート
  // -------------------------------------------------------
  if ((q.includes('担当者会議') || q.includes('議事録')) && (q.includes('テンプレート') || q.includes('書き方') || q.includes('作成'))) {
    return `担当者会議の議事録テンプレートです。\n\n【議事録テンプレート】\n\n日時：令和〇年〇月〇日（〇）〇〇：〇〇〜\n場所：〇〇\n出席者：ケアマネジャー、訪問介護員、訪問看護師、ご本人、ご家族\n\n1. 開会\n2. 利用者の状況報告\n   ・身体状況：\n   ・生活状況：\n   ・本人の意向：\n3. ケアプランの確認・見直し\n   ・長期目標の達成状況：\n   ・短期目標の達成状況：\n   ・サービス内容の変更点：\n4. 各サービス事業所からの報告\n5. 今後の支援方針\n6. 閉会\n\n※議事録は会議後速やかに作成し、関係者に配布してください。`
  }

  // -------------------------------------------------------
  // 利用者一覧・人数確認
  // -------------------------------------------------------
  if (q.includes('利用者') && (q.includes('一覧') || q.includes('何人') || q.includes('登録') || q.includes('教えて'))) {
    if (users.length === 0) return '利用者はまだ登録されていません。'
    return `現在登録されている利用者は${users.length}名です。\n\n` +
      users.map((u) => `・${u.name}（${u.careLevel}、担当：${u.staffName}）`).join('\n')
  }

  // -------------------------------------------------------
  // モニタリング
  // -------------------------------------------------------
  if (q.includes('モニタリング')) {
    if (matchedUser) {
      const userMonitorings = monitorings.filter((m) => m.userId === matchedUser.id)
      if (userMonitorings.length === 0) return `${matchedUser.name}さんのモニタリング記録はまだありません。`
      const latest = userMonitorings[userMonitorings.length - 1]
      return `${matchedUser.name}さんの最新モニタリング（${latest.date}）:\n\n身体状況：${latest.physicalCondition}\n精神状況：${latest.mentalCondition}\nサービス利用状況：${latest.serviceStatus}\n課題・問題点：${latest.issues || 'なし'}`
    }
    return `モニタリングについて\n\nモニタリングは少なくとも月1回実施することが義務付けられています。\n利用者の状態変化・目標の達成状況・サービスの適切性を確認し、必要に応じてケアプランを見直します。\n\n現在のモニタリング記録数：${monitorings.length}件`
  }

  // -------------------------------------------------------
  // デフォルト：入力内容をそのまま活用した汎用回答
  // -------------------------------------------------------
  return generateGenericNote(q, 100)
}

// -------------------------------------------------------
// 文章生成ヘルパー関数
// -------------------------------------------------------

function generateProgressNote(sourceText: string, targetChars: number, userName?: string): string {
  const name = userName ? `${userName}様` : '利用者様'
  const base = sourceText.replace(/上記|それを|これを|以下|文章を|作成して|書いて|含めて|\d+文字程度/g, '').trim()
  const content = base.length > 5 ? base : '体調変わりなく過ごされている'

  const templates = [
    `${name}の状態を確認。${content}。本人より「いつも通り過ごせています」との発言あり。食欲・睡眠ともに良好で、日常生活動作も安定して実施できている。引き続き見守りを継続する。`,
    `訪問時、${name}は${content}。バイタル測定実施（異常なし）。本人の意向を確認し、現在のサービス継続に同意を得た。次回訪問時も継続して経過観察を行う予定。`,
    `${name}の定期確認を実施。${content}。家族より「変わりなく生活できている」との報告あり。現在のケアプランに沿ったサービス提供が適切に行われており、目標に向けて順調に経過している。`,
  ]

  const result = templates[Math.floor(Math.random() * templates.length)]
  return adjustLength(result, targetChars)
}

function generateCarePlanText(sourceText: string, _targetChars: number): string {
  const base = sourceText.replace(/上記|それを|これを|以下|文章を|作成して|書いて|含めて|\d+文字程度/g, '').trim()
  return `【ケアプラン文章例】\n\n${base}\n\n上記の状況を踏まえ、以下のケアプランを策定します。\n\n【長期目標】\n現在の生活を継続しながら、心身の状態を維持・向上させることができる\n\n【短期目標】\n日常生活において必要なサポートを受けながら、安定した生活を送ることができる\n\n【サービス内容】\n・定期的な状態確認と必要なサービスの提供\n・家族との連携による在宅生活の支援`
}

function generateMonitoringText(sourceText: string, targetChars: number): string {
  const base = sourceText.replace(/上記|それを|これを|以下|文章を|作成して|書いて|含めて|\d+文字程度/g, '').trim()
  const content = base.length > 5 ? base : '体調変わりなく過ごされている'
  const result = `モニタリング実施。${content}。現在のサービス内容は利用者の状態・意向に合致しており、ケアプランの目標達成に向けて適切に支援が行われている。サービス継続の意向を確認し、次回モニタリングを1ヶ月後に実施予定。`
  return adjustLength(result, targetChars)
}

function generateMeetingText(sourceText: string, _targetChars: number): string {
  const base = sourceText.replace(/上記|それを|これを|以下|文章を|作成して|書いて|含めて|\d+文字程度/g, '').trim()
  return `【担当者会議 議事録】\n\n${base}\n\n上記の状況について関係者間で情報共有を行った。各サービス担当者よりケアプランの目標達成状況について報告があり、現状のサービス継続が適切との合意を得た。次回会議は3ヶ月後を目安に開催予定。`
}

function generateGenericNote(sourceText: string, targetChars: number): string {
  const base = sourceText.replace(/上記|それを|これを|以下|文章を|作成して|書いて|含めて|\d+文字程度/g, '').trim()
  if (base.length < 5) {
    return `ご質問ありがとうございます。\n\n以下のような質問にお答えできます：\n・「〇〇さんの支援経過を要約してください」\n・「体調変わりなく過ごされている。上記を含めて100文字程度の支援経過を作成して」\n・「転倒リスクが高い利用者のケアプラン文言例を生成してください」\n・「認知症の方への支援経過の書き方のポイントを教えてください」\n・「担当者会議の議事録テンプレートを作成してください」`
  }
  const result = `${base}。本人の状態を確認し、日常生活全般において大きな問題なく経過している。引き続き定期的なモニタリングを行い、状態変化に応じた支援を継続していく。`
  return adjustLength(result, targetChars)
}

function adjustLength(text: string, targetChars: number): string {
  if (targetChars <= 0) return text
  if (text.length <= targetChars + 20) return text
  // 文末で切り詰め
  return text.substring(0, targetChars) + '。'
}

export async function askClaude(messages: ClaudeMessage[]): Promise<string> {
  await sleep(800 + Math.random() * 700)

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUserMessage) return '質問が見つかりませんでした。'

  const rawContent = lastUserMessage.content
  const questionMatch = rawContent.match(/質問: ([\s\S]+)$/)
  const query = questionMatch ? questionMatch[1].trim() : rawContent

  return generateMockReply(query)
}
