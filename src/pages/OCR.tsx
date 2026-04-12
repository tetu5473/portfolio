import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import styles from './OCR.module.css'

const OCR_SPACE_KEY = import.meta.env.VITE_OCR_SPACE_KEY as string

async function extractTextWithOcrSpace(file: File): Promise<string> {
  if (!OCR_SPACE_KEY) {
    throw new Error('APIキーが設定されていません。.env の VITE_OCR_SPACE_KEY を設定してください。')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', 'jpn')
  formData.append('OCREngine', '1')
  formData.append('isOverlayRequired', 'false')
  formData.append('detectOrientation', 'true')

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { apikey: OCR_SPACE_KEY },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`APIエラー: ${response.status}`)
  }

  const data = await response.json()

  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage?.[0] ?? 'OCR処理エラー')
  }

  return data.ParsedResults?.[0]?.ParsedText ?? ''
}

export default function OCR() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [resultText, setResultText] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function loadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setResultText('')
    setStatusText('')
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  function handleReset() {
    setImageFile(null)
    setImageUrl(null)
    setResultText('')
    setStatusText('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleOCR() {
    if (!imageFile) return
    setIsProcessing(true)
    setStatusText('OCR処理中...')

    try {
      const text = await extractTextWithOcrSpace(imageFile)
      setResultText(text)
      setStatusText('完了')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました'
      setStatusText(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(resultText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.page}>
      {!imageFile ? (
        <div
          className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <input
            ref={inputRef}
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <span className={styles.dropIcon}>🖼️</span>
          <p className={styles.dropText}>画像をドラッグ&amp;ドロップ</p>
          <p className={styles.dropSubText}>またはクリックしてファイルを選択（PNG・JPG・GIF等）</p>
        </div>
      ) : (
        <div className={styles.preview}>
          <img src={imageUrl!} alt="アップロード画像" className={styles.previewImg} />
          <div className={styles.previewInfo}>
            <p className={styles.fileName}>{imageFile.name}</p>
            <p className={styles.dropSubText}>{(imageFile.size / 1024).toFixed(1)} KB</p>
            <div>
              <button
                className={styles.startBtn}
                onClick={handleOCR}
                disabled={isProcessing}
              >
                {isProcessing ? 'OCR処理中...' : 'OCR開始'}
              </button>
              <button
                className={styles.resetBtn}
                onClick={handleReset}
                disabled={isProcessing}
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      )}

      {(isProcessing || statusText) && (
        <div className={styles.progressSection}>
          <p className={styles.progressStatus}>{statusText}</p>
        </div>
      )}

      {resultText && (
        <div className={styles.resultSection}>
          <div className={styles.resultHeader}>
            <span className={styles.resultTitle}>認識結果</span>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'コピー済み！' : 'テキストをコピー'}
            </button>
          </div>
          <textarea
            className={styles.resultText}
            value={resultText}
            onChange={(e) => setResultText(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
