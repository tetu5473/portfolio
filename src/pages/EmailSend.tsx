/**
 * EmailSend.tsx — メール送信フォームページ
 * EmailJS が設定されている場合は実際に送信し、未設定の場合はデモモードで動作する
 */
import { useState, type FormEvent } from 'react'
import { sendEmail, isEmailJSConfigured } from '../utils/emailUtils'
import styles from './EmailSend.module.css'

export default function EmailSend() {
  const configured = isEmailJSConfigured()

  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleReset() {
    setTo('')
    setSubject('')
    setBody('')
    setSuccessMsg('')
    setErrorMsg('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')
    setIsSending(true)

    try {
      if (!configured) {
        // mock
        await new Promise((r) => setTimeout(r, 800))
        setSuccessMsg('送信完了（デモ）— EmailJSが設定されていないため、実際には送信されていません')
      } else {
        await sendEmail({ to, subject, body })
        setSuccessMsg(`「${to}」へメールを送信しました`)
        handleReset()
      }
    } catch (err) {
      setErrorMsg('送信に失敗しました。EmailJSの設定を確認してください。')
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {!configured && (
          <div className={styles.mockBanner}>
            ⚠️ EmailJS未設定のためデモモードです。送信ボタンを押すと「送信完了（デモ）」と表示されます。
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="emailTo">宛先</label>
            <input
              id="emailTo"
              className={styles.input}
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="example@example.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="emailSubject">件名</label>
            <input
              id="emailSubject"
              className={styles.input}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="件名を入力"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="emailBody">本文</label>
            <textarea
              id="emailBody"
              className={styles.textarea}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="本文を入力..."
              required
            />
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
              disabled={isSending}
            >
              クリア
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSending}
            >
              {isSending ? '送信中...' : '送信'}
            </button>
          </div>
        </form>

        {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      </div>
    </div>
  )
}
