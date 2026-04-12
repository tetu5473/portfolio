import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { seedIfNeeded } from './utils/storage'
import { isLoggedIn } from './utils/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserList from './pages/users/UserList'
import UserProfile from './pages/users/UserProfile'
import CarePlanList from './pages/carePlans/CarePlanList'
import ProgressNoteList from './pages/progressNotes/ProgressNoteList'
import MonitoringList from './pages/monitoring/MonitoringList'
import MeetingList from './pages/meetings/MeetingList'
import AISearch from './pages/AISearch'
import OCR from './pages/OCR'
import EmailSend from './pages/EmailSend'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())

  useEffect(() => {
    const handler = () => setLoggedIn(isLoggedIn())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  if (!loggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  useEffect(() => {
    seedIfNeeded()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/care-plans" element={<CarePlanList />} />
          <Route path="/progress-notes" element={<ProgressNoteList />} />
          <Route path="/monitoring" element={<MonitoringList />} />
          <Route path="/meetings" element={<MeetingList />} />
          <Route path="/search" element={<AISearch />} />
          <Route path="/ocr" element={<OCR />} />
          <Route path="/email" element={<EmailSend />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
