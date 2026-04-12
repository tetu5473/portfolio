import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../utils/auth'
import styles from './Login.module.css'

export default function Login() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (login(id, password)) {
      navigate('/')
    } else {
      setError('IDまたはパスワードが正しくありません')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>♡</span>
          <span className={styles.logoText}>CareManager</span>
          <p className={styles.subtitle}>介護ケア管理システム</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="loginId">ユーザーID</label>
            <input
              id="loginId"
              className={styles.input}
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="例: admin"
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="loginPassword">パスワード</label>
            <input
              id="loginPassword"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              autoComplete="current-password"
              required
            />
          </div>

          <button className={styles.submitBtn} type="submit">
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}
