import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import Skills from '@/pages/Skills'
import Projects from '@/pages/Projects'
import Experience from '@/pages/Experience'
import Education from '@/pages/Education'
import Certifications from '@/pages/Certifications'
import BiometricSetup from '@/pages/BiometricSetup'
import Settings from '@/pages/Settings'

export default function App() {
  const basename = import.meta.env.PROD ? '/admin' : '/'
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/"                element={<Dashboard />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/skills"          element={<Skills />} />
          <Route path="/projects"        element={<Projects />} />
          <Route path="/experience"      element={<Experience />} />
          <Route path="/education"       element={<Education />} />
          <Route path="/certifications"  element={<Certifications />} />
          <Route path="/setup-biometric" element={<BiometricSetup />} />
          <Route path="/settings"        element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
