/**
 * pdfUtils.ts — PDF出力ユーティリティ
 *
 * 【文字化け対策について】
 * jsPDF は日本語フォントを標準でサポートしていないため、そのまま使うと
 * 日本語テキストが文字化け（ローマ字変換）してしまう問題がある。
 * この問題を解決するため、ブラウザの print 機能を利用する方式に変更した。
 *
 * 【仕組み】
 * printHTML() が HTML 文字列を組み立てて新しいウィンドウで開き、
 * window.print() を呼び出すことでブラウザの印刷ダイアログを表示する。
 * ブラウザの印刷は OS のフォントレンダリングを使うため、日本語が正しく表示される。
 */
import type { User, CarePlan, ProgressNote, Monitoring, Meeting } from '../types'

// ── 共通ヘルパー ──────────────────────────────────────────

/**
 * printHTML — HTML 文字列を新しいウィンドウで開いて印刷ダイアログを起動する
 * @param title  ページタイトル（ブラウザの印刷プレビューに表示される）
 * @param body   <body> 内に挿入する HTML 文字列
 */
function printHTML(title: string, body: string) {
  const win = window.open('', '_blank')
  if (!win) return

  // @media print スタイルで画面表示用のスタイルを無効化し、印刷に最適化する
  win.document.write(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, 'Noto Sans JP', sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      padding: 16mm 18mm;
    }
    h1 {
      font-size: 14pt;
      color: #2563EB;
      border-bottom: 2px solid #2563EB;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }
    h2 {
      font-size: 12pt;
      color: #2563EB;
      margin: 18px 0 8px;
      border-left: 3px solid #2563EB;
      padding-left: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin-bottom: 12px;
    }
    th {
      background: #2563EB;
      color: #fff;
      padding: 6px 8px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #E2E8F0;
      vertical-align: top;
    }
    tr:nth-child(even) td { background: #F0F5FF; }
    .meta {
      font-size: 9pt;
      color: #666;
      margin-bottom: 16px;
    }
    /* 印刷時: テーブルがページをまたぐとき行が分割されないようにする */
    @media print {
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${body}
  <div class="meta" style="margin-top:20px; text-align:right;">
    出力日時: ${new Date().toLocaleDateString('ja-JP')}　CareManager
  </div>
</body>
</html>`)

  win.document.close()
  win.focus()
  // ウィンドウの読み込みが完了してから印刷ダイアログを開く
  win.onload = () => win.print()
}

/**
 * escapeHtml — XSS対策: ユーザーデータをHTML文字列に埋め込む前にエスケープする
 * < > & " ' の5文字を HTML エンティティに変換する
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── 各ページ向けエクスポート関数 ─────────────────────────

/**
 * exportUserListPDF — 利用者一覧を印刷する
 * @param users  出力する利用者データの配列
 */
export function exportUserListPDF(users: User[]) {
  const rows = users.map((u) => `
    <tr>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.nameKana)}</td>
      <td>${escapeHtml(u.birthDate)}</td>
      <td>${u.gender === 'male' ? '男性' : '女性'}</td>
      <td>${escapeHtml(u.careLevel)}</td>
      <td>${escapeHtml(u.staffName)}</td>
    </tr>`).join('')

  const body = `
    <h1>利用者一覧</h1>
    <table>
      <thead>
        <tr><th>氏名</th><th>ふりがな</th><th>生年月日</th><th>性別</th><th>介護度</th><th>担当者</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`

  printHTML('利用者一覧', body)
}

/**
 * exportUserProfilePDF — 利用者プロフィールと関連データを印刷する
 * @param user        利用者データ
 * @param plans       利用者のケアプラン配列
 * @param notes       利用者の支援経過配列
 * @param monitorings 利用者のモニタリング配列
 * @param meetings    利用者の担当者会議配列
 */
export function exportUserProfilePDF(
  user: User,
  plans: CarePlan[],
  notes: ProgressNote[],
  monitorings: Monitoring[],
  meetings: Meeting[]
) {
  // 基本情報テーブル
  const infoRows = [
    ['氏名', `${escapeHtml(user.name)}（${escapeHtml(user.nameKana)}）`],
    ['生年月日', `${escapeHtml(user.birthDate)}　${user.gender === 'male' ? '男性' : '女性'}`],
    ['介護度', escapeHtml(user.careLevel)],
    ['担当者', escapeHtml(user.staffName)],
    ['電話番号', escapeHtml(user.phone)],
    ['住所', escapeHtml(user.address)],
    ['緊急連絡先', escapeHtml(user.emergencyContact)],
  ].map(([label, value]) => `<tr><td style="font-weight:600;width:120px;">${label}</td><td>${value}</td></tr>`).join('')

  // ケアプランテーブル
  const planRows = plans.map((p) => `
    <tr>
      <td>${escapeHtml(p.startDate)} 〜 ${escapeHtml(p.endDate)}</td>
      <td>${escapeHtml(p.longTermGoal)}</td>
      <td>${escapeHtml(p.shortTermGoal)}</td>
    </tr>`).join('')

  // 支援経過テーブル（最新5件）
  const noteRows = notes.slice(0, 5).map((n) => `
    <tr>
      <td style="white-space:nowrap">${escapeHtml(n.date)}</td>
      <td style="white-space:nowrap">${escapeHtml(n.author)}</td>
      <td style="white-space:pre-wrap">${escapeHtml(n.content)}</td>
    </tr>`).join('')

  const body = `
    <h1>${escapeHtml(user.name)}さん プロフィール</h1>
    <h2>基本情報</h2>
    <table><tbody>${infoRows}</tbody></table>
    ${plans.length > 0 ? `
    <h2>ケアプラン</h2>
    <table>
      <thead><tr><th>期間</th><th>長期目標</th><th>短期目標</th></tr></thead>
      <tbody>${planRows}</tbody>
    </table>` : ''}
    ${notes.length > 0 ? `
    <h2>支援経過（直近5件）</h2>
    <table>
      <thead><tr><th style="width:90px">日付</th><th style="width:80px">記録者</th><th>内容</th></tr></thead>
      <tbody>${noteRows}</tbody>
    </table>` : ''}
    <div class="meta">モニタリング: ${monitorings.length}件 / 担当者会議: ${meetings.length}件</div>`

  printHTML(`${user.name} - プロフィール`, body)
}

/**
 * exportProgressNotesPDF — 支援経過一覧を印刷する
 * @param notes  出力する支援経過データの配列
 * @param users  利用者一覧（userId → 氏名の解決に使用）
 */
export function exportProgressNotesPDF(notes: ProgressNote[], users: User[]) {
  // userId から氏名を素早く引けるようにMapを作成する
  const usersMap = new Map(users.map((u) => [u.id, u.name]))

  const rows = notes.map((n) => `
    <tr>
      <td style="white-space:nowrap">${escapeHtml(n.date)}</td>
      <td style="white-space:nowrap">${escapeHtml(usersMap.get(n.userId) ?? '—')}</td>
      <td style="white-space:nowrap">${escapeHtml(n.author)}</td>
      <td style="white-space:pre-wrap">${escapeHtml(n.content)}</td>
    </tr>`).join('')

  const body = `
    <h1>支援経過一覧</h1>
    <table>
      <thead>
        <tr><th style="width:90px">日付</th><th style="width:100px">利用者</th><th style="width:80px">記録者</th><th>内容</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`

  printHTML('支援経過一覧', body)
}

/**
 * exportCarePlansPDF — ケアプラン一覧を印刷する
 * @param plans  出力するケアプランデータの配列
 * @param users  利用者一覧（userId → 氏名の解決に使用）
 */
export function exportCarePlansPDF(plans: CarePlan[], users: User[]) {
  const usersMap = new Map(users.map((u) => [u.id, u.name]))

  const rows = plans.map((p) => `
    <tr>
      <td style="white-space:nowrap">${escapeHtml(usersMap.get(p.userId) ?? '—')}</td>
      <td style="white-space:nowrap">${escapeHtml(p.startDate)} 〜 ${escapeHtml(p.endDate)}</td>
      <td style="white-space:pre-wrap">${escapeHtml(p.longTermGoal)}</td>
      <td style="white-space:pre-wrap">${escapeHtml(p.shortTermGoal)}</td>
    </tr>`).join('')

  const body = `
    <h1>ケアプラン一覧</h1>
    <table>
      <thead>
        <tr><th style="width:100px">利用者</th><th style="width:140px">期間</th><th>長期目標</th><th>短期目標</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`

  printHTML('ケアプラン一覧', body)
}

/**
 * exportMonitoringsPDF — モニタリング一覧を印刷する
 * @param monitorings  出力するモニタリングデータの配列
 * @param users        利用者一覧（userId → 氏名の解決に使用）
 */
export function exportMonitoringsPDF(monitorings: Monitoring[], users: User[]) {
  const usersMap = new Map(users.map((u) => [u.id, u.name]))

  const rows = monitorings.map((m) => `
    <tr>
      <td style="white-space:nowrap">${escapeHtml(m.date)}</td>
      <td style="white-space:nowrap">${escapeHtml(usersMap.get(m.userId) ?? '—')}</td>
      <td style="white-space:nowrap">${escapeHtml(m.author)}</td>
      <td style="white-space:pre-wrap">${escapeHtml(m.physicalCondition)}</td>
      <td style="white-space:pre-wrap">${escapeHtml(m.mentalCondition)}</td>
      <td style="white-space:pre-wrap">${escapeHtml(m.issues ?? '—')}</td>
    </tr>`).join('')

  const body = `
    <h1>モニタリング一覧</h1>
    <table>
      <thead>
        <tr>
          <th style="width:90px">日付</th>
          <th style="width:90px">利用者</th>
          <th style="width:70px">記録者</th>
          <th>身体状態</th>
          <th>精神状態</th>
          <th>課題・問題点</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`

  printHTML('モニタリング一覧', body)
}
