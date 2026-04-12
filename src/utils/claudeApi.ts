import { getUsers, getProgressNotes, getCarePlans, getMonitoringList, getMeetings } from './storage'

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// -------------------------------------------------------
// メインの回答生成
// -------------------------------------------------------
function generateReply(query: string): string {
  const q = query.trim()
  const users = getUsers()
  const notes = getProgressNotes()
  const plans = getCarePlans()
  const monitorings = getMonitoringList()
  const meetings = getMeetings()

  const matchedUser = users.find((u) => {
    const nameNoSpace = u.name.replace(/\s/g, '')
    return q.includes(u.name) || q.includes(nameNoSpace)
  })

  // ── 文章生成系 ──────────────────────────────────────────
  const isWrite = /文章|作成して|書いて|作って|文を|文にして|文字程度|文字くらい|記録して|まとめて|例文|テンプレ|雛形/.test(q)

  if (isWrite) {
    const charMatch = q.match(/(\d+)文字/)
    const targetChars = charMatch ? parseInt(charMatch[1]) : 100
    const base = q.replace(/上記|それを|これを|以下|文章を?|作成して|書いて|含めて|\d+文字程度|\d+文字くらい/g, '').trim()

    if (/支援経過|経過記録|訪問記録|サービス記録/.test(q)) return genProgressNote(base, targetChars, matchedUser?.name)
    if (/ケアプラン|長期目標|短期目標/.test(q)) return genCarePlan(base, matchedUser?.name)
    if (/モニタリング/.test(q)) return genMonitoring(base, targetChars, matchedUser?.name)
    if (/担当者会議|会議|議事録/.test(q)) return genMeeting(base, matchedUser?.name)
    return genProgressNote(base, targetChars, matchedUser?.name)
  }

  // ── 特定利用者の情報照会 ────────────────────────────────
  if (matchedUser) {
    const userNotes = notes.filter((n) => n.userId === matchedUser.id)
    const userPlan = plans.find((p) => p.userId === matchedUser.id)
    const userMonitoring = monitorings.filter((m) => m.userId === matchedUser.id)
    const userMeetings = meetings.filter((m) => m.userId === matchedUser.id)

    if (/要約|まとめ|最近|状況|状態|教えて/.test(q)) {
      const recent = userNotes.slice(-3)
      const latestMonitoring = userMonitoring[userMonitoring.length - 1]
      let res = `**${matchedUser.name}さん（${matchedUser.careLevel}）のサマリー**\n\n`
      res += `担当者：${matchedUser.staffName}\n\n`
      if (userPlan) {
        res += `【ケアプラン】\n長期目標：${userPlan.longTermGoal}\n短期目標：${userPlan.shortTermGoal}\n\n`
      }
      if (latestMonitoring) {
        res += `【最新モニタリング（${latestMonitoring.date}）】\n身体：${latestMonitoring.physicalCondition}\n精神：${latestMonitoring.mentalCondition}\n課題：${latestMonitoring.issues || 'なし'}\n\n`
      }
      if (recent.length > 0) {
        res += `【最近の支援経過】\n` + recent.map((n) => `・${n.date}：${n.content}`).join('\n')
      } else {
        res += '支援経過の記録はまだありません。'
      }
      return res
    }

    if (/支援経過|経過/.test(q)) {
      if (userNotes.length === 0) return `${matchedUser.name}さんの支援経過記録はまだ登録されていません。`
      const recent = userNotes.slice(-5)
      return `**${matchedUser.name}さんの支援経過（直近${recent.length}件）**\n\n` +
        recent.map((n) => `【${n.date}】記録者：${n.author}\n${n.content}`).join('\n\n')
    }

    if (/ケアプラン|目標/.test(q)) {
      if (!userPlan) return `${matchedUser.name}さんのケアプランはまだ登録されていません。`
      return `**${matchedUser.name}さんのケアプラン**\n\n長期目標：${userPlan.longTermGoal}\n短期目標：${userPlan.shortTermGoal}\n\nサービス内容：${userPlan.services}\n\n有効期間：${userPlan.startDate} ～ ${userPlan.endDate}`
    }

    if (/モニタリング/.test(q)) {
      if (userMonitoring.length === 0) return `${matchedUser.name}さんのモニタリング記録はまだありません。`
      const latest = userMonitoring[userMonitoring.length - 1]
      return `**${matchedUser.name}さんの最新モニタリング（${latest.date}）**\n\n身体状況：${latest.physicalCondition}\n\n精神状況：${latest.mentalCondition}\n\nサービス利用状況：${latest.serviceStatus}\n\n課題・問題点：${latest.issues || 'なし'}`
    }

    if (/会議|担当者/.test(q)) {
      if (userMeetings.length === 0) return `${matchedUser.name}さんの担当者会議記録はまだありません。`
      const latest = userMeetings[userMeetings.length - 1]
      return `**${matchedUser.name}さんの最新担当者会議（${latest.date.replace('T', ' ')}）**\n\n場所：${latest.location}\n参加者：${latest.participants}\n\n議題：${latest.agenda}\n\n検討内容：${latest.discussion || '—'}\n\n結論：${latest.conclusion || '—'}\n\n今後の課題：${latest.futureTasks || '—'}`
    }
  }

  // ── 全体の統計・一覧 ────────────────────────────────────
  if (/利用者.*(?:一覧|何人|人数|登録|全員|全体)/.test(q)) {
    if (users.length === 0) return '利用者はまだ登録されていません。'
    return `**現在の登録利用者（${users.length}名）**\n\n` +
      users.map((u) => `・**${u.name}**（${u.careLevel}）担当：${u.staffName}`).join('\n')
  }

  if (/転倒.*(?:リスク|高い|注意)/.test(q) || /(?:転倒リスク).*利用者/.test(q)) {
    const highRisk = users.filter((u) => u.careLevel === '要介護3' || u.careLevel === '要介護4' || u.careLevel === '要介護5')
    if (highRisk.length === 0) return '転倒リスクが特に高い（要介護3以上）利用者は現在登録されていません。'
    return `**転倒リスクが高い利用者（要介護3以上）**\n\n` +
      highRisk.map((u) => {
        const plan = plans.find((p) => p.userId === u.id)
        return `・**${u.name}**（${u.careLevel}）\n　${plan ? `ケアプラン：${plan.shortTermGoal}` : 'ケアプラン未登録'}`
      }).join('\n\n') +
      '\n\n転倒予防の観点から、環境整備・移動時の見守り・定期的な筋力評価を継続してください。'
  }

  if (/最近.*支援経過|支援経過.*最近|新しい.*記録/.test(q)) {
    const recent = [...notes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
    if (recent.length === 0) return '支援経過の記録がまだありません。'
    return `**最近の支援経過（${recent.length}件）**\n\n` +
      recent.map((n) => {
        const u = users.find((u) => u.id === n.userId)
        return `【${n.date}】${u?.name ?? '不明'}（記録者：${n.author}）\n${n.content}`
      }).join('\n\n')
  }

  if (/課題|問題|リスク/.test(q) && !/ケアプラン/.test(q)) {
    const issueList = monitorings.filter((m) => m.issues && m.issues !== 'なし' && m.issues.trim() !== '')
    if (issueList.length === 0) return '現在、課題・問題点として記録されている項目はありません。'
    return `**現在の課題・問題点（モニタリングより）**\n\n` +
      issueList.map((m) => {
        const u = users.find((u) => u.id === m.userId)
        return `・**${u?.name ?? '不明'}**（${m.date}）：${m.issues}`
      }).join('\n\n')
  }

  // ── 介護知識・書き方ガイド ───────────────────────────────
  if (/支援経過.*(?:書き方|ポイント|コツ)|(?:書き方|ポイント).*支援経過/.test(q)) {
    return `**支援経過の書き方のポイント**\n\n【基本構成】\n① 日時・記録者\n② 利用者の状態（身体・精神・生活）\n③ 実施したサービス内容\n④ 利用者・家族の反応・発言\n⑤ 今後の課題・対応方針\n\n【記録のコツ】\n・主観的表現を避け、客観的な事実を記録する\n　✗「気分が悪そうだった」→ ✓「表情が曇っており、「頭が重い」との発言あり」\n・バイタル（血圧・体温・脈拍）は数値で記録する\n・前回からの変化・気づきを明記する\n\n【認知症の方の場合の追加ポイント】\n・表情・言動を具体的に記録する\n・混乱や不安の有無を記載する\n・コミュニケーション方法の工夫を記録する`
  }

  if (/モニタリング.*(?:書き方|ポイント|頻度|義務)|(?:書き方|ポイント).*モニタリング/.test(q)) {
    return `**モニタリングの実施ポイント**\n\n【実施頻度】\n少なくとも月1回の実施が義務付けられています。\n状態変化がある場合はその都度実施してください。\n\n【確認項目】\n① 身体状況（体重・バイタル・ADL変化）\n② 精神状況（意欲・表情・認知機能）\n③ サービス利用状況（利用回数・本人満足度）\n④ 目標の達成状況（長期・短期目標の進捗）\n⑤ 課題・問題点\n\n【ケアプラン見直しの目安】\n・状態が大きく変化した場合\n・サービス内容が実態と合わなくなった場合\n・本人・家族の意向が変わった場合`
  }

  if (/ケアプラン.*(?:書き方|ポイント|作り方)|(?:書き方|ポイント).*ケアプラン/.test(q)) {
    return `**ケアプラン作成のポイント**\n\n【長期目標の書き方】\n・本人の「望む暮らし」を反映させる\n・達成可能な現実的な目標にする\n・期間は通常6ヶ月〜1年\n\n例：「自宅での生活を継続し、家族と笑顔で過ごすことができる」\n\n【短期目標の書き方】\n・長期目標を達成するための具体的なステップ\n・期間は通常3〜6ヶ月\n・測定・評価できる表現にする\n\n例：「週3回のデイサービスに参加し、下肢筋力を維持できる」\n\n【サービス内容】\n誰が・何を・いつ・どのくらいの頻度で行うかを具体的に記載する`
  }

  if (/担当者会議.*(?:書き方|ポイント|流れ|テンプレ)|(?:書き方|ポイント|テンプレ).*担当者会議/.test(q)) {
    return `**担当者会議の進め方・記録のポイント**\n\n【会議の流れ】\n① 開会・参加者確認\n② 利用者の現状報告（各サービス担当者から）\n③ ケアプランの目標達成状況の確認\n④ 課題・問題点の共有と検討\n⑤ 今後のサービス方針の決定\n⑥ 閉会\n\n【記録のポイント】\n・議題ごとに「検討した内容」「結論」「今後の課題」を明確に分けて記録する\n・参加者全員の発言内容を要約して記載する\n・決定事項は誰が・いつまでに・何をするかを明記する\n\n【開催頻度】\nケアプラン作成時・更新時・状態変化時に開催。少なくとも6ヶ月に1回。`
  }

  if (/転倒.*防止|転倒.*予防|転倒.*対策/.test(q)) {
    return `**転倒防止・予防の対策ポイント**\n\n【環境整備】\n・手すりの設置（玄関・廊下・トイレ・浴室）\n・床の段差解消・滑り止めマット設置\n・夜間の足元照明（センサーライト推奨）\n・不要な家具・障害物の除去\n\n【身体面のアプローチ】\n・下肢筋力トレーニング（椅子を使ったスクワット等）\n・バランス訓練\n・適切な履き物の選択（かかとのある滑りにくい靴）\n・服薬管理（ふらつきを起こす薬の確認）\n\n【介護サービスでの対応】\n・移動時の見守り・介助\n・定期的な転倒リスクアセスメントの実施\n・本人・家族への転倒予防指導`
  }

  if (/認知症.*(?:対応|ケア|支援|接し方)/.test(q)) {
    return `**認知症の方への対応・ケアのポイント**\n\n【コミュニケーション】\n・ゆっくり・はっきり・短い言葉で話す\n・一度に複数の指示を出さない\n・否定せず、本人の感情に寄り添う\n・「なぜ？」という問い詰めは避ける\n\n【生活環境】\n・生活リズムを一定に保つ（起床・食事・就寝時間）\n・慣れ親しんだ環境・物を大切にする\n・見当識を助けるカレンダー・時計の設置\n\n【ケア記録のポイント】\n・BPSD（行動・心理症状）の内容と対応を具体的に記録\n・良い状態のときの様子も記録する\n・家族への介護方法の情報共有を欠かさない`
  }

  // ── デフォルト ──────────────────────────────────────────
  return pick([
    `ご質問ありがとうございます。\n\n以下のような質問にお答えできます：\n\n【利用者情報の確認】\n・「山田花子さんの状況を教えてください」\n・「転倒リスクが高い利用者は誰ですか」\n・「最近の支援経過を確認したい」\n\n【文章作成サポート】\n・「体調変わりなく過ごされている。100文字程度の支援経過を作成して」\n・「転倒リスクが高い方向けのケアプラン文言を生成して」\n・「モニタリングの文章テンプレートを作って」\n\n【介護知識・書き方ガイド】\n・「支援経過の書き方のポイントを教えて」\n・「担当者会議の進め方を教えて」\n・「認知症の方への対応のポイントを教えて」`,

    `「${q}」について確認しました。\n\n現在登録されているデータをもとに回答します。\n\n利用者数：${users.length}名\n支援経過記録：${notes.length}件\nケアプラン：${plans.length}件\nモニタリング：${monitorings.length}件\n担当者会議：${meetings.length}件\n\n特定の利用者名や知りたい内容を含めて、もう少し具体的に質問いただくとより詳しくお答えできます。`,
  ])
}

// ── 文章生成ヘルパー ──────────────────────────────────────

function genProgressNote(base: string, targetChars: number, userName?: string): string {
  const name = userName ? `${userName}様` : '利用者様'
  const content = base.length > 5 ? base : '体調変わりなく過ごされている'

  const templates = [
    `訪問時、${name}は${content}。バイタル測定（異常なし）。本人より「いつも通り過ごせています」との発言あり。食欲・睡眠ともに良好で、日常生活動作も安定して実施できている。引き続き見守りを継続する。`,
    `${name}の定期訪問を実施。${content}。家族より「変わりなく生活できている」との報告あり。現在のサービス内容が適切に機能しており、目標に向けて順調に経過している。次回も継続して観察予定。`,
    `サービス提供時、${name}は${content}。本人の意向を確認し、現在のサービス継続に同意を得た。特記すべき変化は見られず安定した経過。次回訪問時も引き続き状態観察を行う。`,
    `${name}への支援を実施。${content}。ADL（日常生活動作）に大きな変化なく経過良好。食事・排泄・移動いずれも現状維持。本人の表情は穏やかで意欲的に活動できている。`,
  ]

  return adjustLength(pick(templates), targetChars)
}

function genCarePlan(base: string, userName?: string): string {
  const name = userName ?? '利用者'
  const content = base.length > 5 ? `${base}の状況を踏まえ、` : ''
  return `**${name}さんのケアプラン文章例**\n\n${content}以下のケアプランを策定します。\n\n【長期目標】\n現在の生活環境を維持しながら、心身ともに安定した在宅生活を継続できる\n\n【短期目標】\n必要なサービスを活用しながら日常生活のADLを維持・向上させることができる\n\n【サービス内容】\n・訪問介護による生活援助・身体介護（週○回）\n・定期的な状態確認とモニタリングの実施\n・家族との連携による在宅生活の継続支援\n・緊急時の対応体制の整備`
}

function genMonitoring(base: string, targetChars: number, userName?: string): string {
  const name = userName ? `${userName}様` : '利用者様'
  const content = base.length > 5 ? base : '体調変わりなく経過良好'
  const result = `${name}のモニタリングを実施。${content}。現在のサービス内容は利用者の状態・意向に合致しており、ケアプランの目標達成に向けて適切に支援が行われている。本人・家族ともにサービスへの満足度は高く、継続の意向を確認。次回モニタリングを1ヶ月後に実施予定。`
  return adjustLength(result, targetChars)
}

function genMeeting(base: string, userName?: string): string {
  const name = userName ?? '利用者'
  const content = base.length > 5 ? base : '現在のサービス内容の確認と今後の支援方針について'
  return `**${name}さんの担当者会議 記録例**\n\n【議題】\n${content}\n\n【検討した内容】\n各サービス担当者より現状の支援状況について報告を受けた。ケアプランの目標達成状況を確認し、現行サービスの継続が適切であるとの意見が多数を占めた。本人・家族の意向についても改めて確認を行った。\n\n【結論】\n現行のサービス内容・頻度を維持して継続することを全員で確認した。\n\n【今後の課題】\n引き続き状態変化のモニタリングを継続し、変化があった場合は速やかに関係者間で情報共有を行う。次回担当者会議は3ヶ月後を目安に開催予定。`
}

function adjustLength(text: string, targetChars: number): string {
  if (targetChars <= 0 || text.length <= targetChars + 20) return text
  return text.substring(0, targetChars) + '。'
}

// ── エクスポート ──────────────────────────────────────────

export async function askClaude(messages: ClaudeMessage[]): Promise<string> {
  await sleep(600 + Math.random() * 600)

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) return '質問が見つかりませんでした。'

  const raw = lastUser.content
  const match = raw.match(/質問: ([\s\S]+)$/)
  const query = match ? match[1].trim() : raw

  return generateReply(query)
}
