import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import TodayTodo from '@/pages/TodayTodo'
import Leads from '@/pages/Leads'
import CustomerDetail from '@/pages/CustomerDetail'
import Appointments from '@/pages/Appointments'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TodayTodo />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/customer/:id" element={<CustomerDetail />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}
