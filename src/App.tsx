import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { seedIfNeeded } from './utils/storage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import UserList from './pages/users/UserList'
import CarePlanList from './pages/carePlans/CarePlanList'
import ProgressNoteList from './pages/progressNotes/ProgressNoteList'
import MonitoringList from './pages/monitoring/MonitoringList'
import MeetingList from './pages/meetings/MeetingList'
import AISearch from './pages/AISearch'

export default function App() {
  useEffect(() => {
    seedIfNeeded()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/care-plans" element={<CarePlanList />} />
          <Route path="/progress-notes" element={<ProgressNoteList />} />
          <Route path="/monitoring" element={<MonitoringList />} />
          <Route path="/meetings" element={<MeetingList />} />
          <Route path="/search" element={<AISearch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
