import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Athletes from './pages/Athletes'
import AthleteDetail from './pages/AthleteDetail'
import Groups from './pages/Groups'
import Schedule from './pages/Schedule'
import Financials from './pages/Financials'
import Equipment from './pages/Equipment'
import Competitions from './pages/Competitions'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/athletes/:id" element={<AthleteDetail />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/financials" element={<Financials />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/competitions" element={<Competitions />} />
      </Routes>
    </Layout>
  )
}
