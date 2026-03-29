import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import Tesseract from 'tesseract.js'
import styles from './OCR.module.css'

export default function OCR() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
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
    setProgress(0)
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
    setProgress(0)
    setStatusText('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleOCR() {
    if (!imageFile) return
    setIsProcessing(true)
    setProgress(0)
    setStatusText('処理を開始しています...')

    try {
      const result = await Tesseract.recognize(imageFile, 'jpn+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
            setStatusText(`テキスト認識中... ${Math.round(m.progress * 100)}%`)
          } else {
            setStatusText(m.status)
          }
        },
      })
      setResultText(result.data.text)
      setProgress(100)
      setStatusText('完了')
    } catch (err) {
      setStatusText('エラーが発生しました')
      console.error(err)
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
          <p className={styles.progressLabel}>処理状況</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
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
