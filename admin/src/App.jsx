import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import Skills from '@/pages/Skills'
import Projects from '@/pages/Projects'
import Experience from '@/pages/Experience'
import Education from '@/pages/Education'
import Certifications from '@/pages/Certifications'

export default function App() {
  const basename = '/'
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                element={<Dashboard />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/skills"          element={<Skills />} />
          <Route path="/projects"        element={<Projects />} />
          <Route path="/experience"      element={<Experience />} />
          <Route path="/education"       element={<Education />} />
          <Route path="/certifications"  element={<Certifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
