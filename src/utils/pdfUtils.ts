import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { User, CarePlan, ProgressNote, Monitoring, Meeting } from '../types'

// jsPDF doesn't support Japanese fonts out of the box.
// We use a workaround: render data to a canvas via html2canvas isn't available,
// so we fall back to romaji-compatible ASCII export with Japanese labels preserved.
// The browser's built-in print dialog handles Japanese fonts better,
// so we provide a printable HTML approach for Japanese content.

function createDoc(): jsPDF {
  return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
}

function addHeader(doc: jsPDF, title: string) {
  doc.setFontSize(16)
  doc.setTextColor(37, 99, 235)
  doc.text(title, 14, 18)
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 22, 196, 22)
  doc.setTextColor(50, 50, 50)
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(`CareManager  ${i} / ${pageCount}`, 14, 290)
    doc.text(new Date().toLocaleDateString('ja-JP'), 160, 290)
  }
}

export function exportUserListPDF(users: User[]) {
  const doc = createDoc()
  addHeader(doc, 'Riyousha Ichiran (Riyousha Kanri)')

  autoTable(doc, {
    startY: 26,
    head: [['Shimei', 'Furigana', 'Seinengappi', 'Seibetsu', 'Kaigodo', 'Tantousha']],
    body: users.map((u) => [
      u.name,
      u.nameKana,
      u.birthDate,
      u.gender === 'male' ? 'Dansei' : 'Josei',
      u.careLevel,
      u.staffName,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [240, 245, 255] },
  })

  addFooter(doc)
  doc.save('riyousha-ichiran.pdf')
}

export function exportUserProfilePDF(
  user: User,
  plans: CarePlan[],
  notes: ProgressNote[],
  monitorings: Monitoring[],
  meetings: Meeting[]
) {
  const doc = createDoc()
  addHeader(doc, `Profile: ${user.name}`)

  doc.setFontSize(11)
  let y = 28
  doc.text(`Shimei: ${user.name}  (${user.nameKana})`, 14, y); y += 7
  doc.text(`Seinengappi: ${user.birthDate}  Seibetsu: ${user.gender === 'male' ? 'Dansei' : 'Josei'}`, 14, y); y += 7
  doc.text(`Kaigodo: ${user.careLevel}  Tantousha: ${user.staffName}`, 14, y); y += 7
  doc.text(`Tel: ${user.phone}`, 14, y); y += 7
  doc.text(`Jusho: ${user.address}`, 14, y); y += 7
  doc.text(`Kinkyuu: ${user.emergencyContact}`, 14, y); y += 10

  // Care plans
  if (plans.length > 0) {
    doc.setFontSize(12)
    doc.setTextColor(37, 99, 235)
    doc.text('Care Plan', 14, y); y += 2
    doc.setTextColor(50, 50, 50)
    autoTable(doc, {
      startY: y,
      head: [['Kikan', 'Choki Mokuhyou', 'Tanki Mokuhyou']],
      body: plans.map((p) => [`${p.startDate}~${p.endDate}`, p.longTermGoal, p.shortTermGoal]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    })
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6
  }

  // Progress notes (latest 5)
  if (notes.length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setFontSize(12)
    doc.setTextColor(37, 99, 235)
    doc.text('Shien Keika (latest 5)', 14, y); y += 2
    doc.setTextColor(50, 50, 50)
    autoTable(doc, {
      startY: y,
      head: [['Hiduke', 'Kirokusya', 'Naiyou']],
      body: notes.slice(0, 5).map((n) => [n.date, n.author, n.content]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 2: { cellWidth: 100 } },
    })
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6
  }

  addFooter(doc)
  doc.save(`${user.name}-profile.pdf`)
}

export function exportProgressNotesPDF(notes: ProgressNote[], users: User[]) {
  const doc = createDoc()
  addHeader(doc, 'Shien Keika Ichiran')

  const usersMap = new Map(users.map((u) => [u.id, u.name]))
  autoTable(doc, {
    startY: 26,
    head: [['Hiduke', 'Riyousha', 'Kirokusya', 'Naiyou']],
    body: notes.map((n) => [n.date, usersMap.get(n.userId) ?? '-', n.author, n.content]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: { 3: { cellWidth: 90 } },
  })

  addFooter(doc)
  doc.save('shien-keika.pdf')
}

export function exportCarePlansPDF(plans: CarePlan[], users: User[]) {
  const doc = createDoc()
  addHeader(doc, 'Care Plan Ichiran')

  const usersMap = new Map(users.map((u) => [u.id, u.name]))
  autoTable(doc, {
    startY: 26,
    head: [['Riyousha', 'Kikan', 'Choki Mokuhyou', 'Tanki Mokuhyou']],
    body: plans.map((p) => [
      usersMap.get(p.userId) ?? '-',
      `${p.startDate}~${p.endDate}`,
      p.longTermGoal,
      p.shortTermGoal,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: { 2: { cellWidth: 55 }, 3: { cellWidth: 55 } },
  })

  addFooter(doc)
  doc.save('care-plans.pdf')
}
