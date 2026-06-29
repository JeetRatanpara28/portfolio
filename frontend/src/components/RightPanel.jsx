import { useEffect } from 'react'
import About from './sections/About'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import Resume from './sections/Resume'
import Contact from './sections/Contact'

const SECTIONS = ['about', 'skills', 'projects', 'resume', 'contact']

export default function RightPanel({ panelRef, onSectionChange }) {
  // Scroll-spy via IntersectionObserver scoped to this panel
  useEffect(() => {
    const panel = panelRef?.current
    if (!panel) return

    const observers = SECTIONS.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null

      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) onSectionChange(id) },
        { root: panel, threshold: 0.35 }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)

    return () => observers.forEach((o) => o.disconnect())
  }, [panelRef, onSectionChange])

  return (
    <div className="min-h-full">
      <About />
      <Skills />
      <Projects />
      <Resume />
      <Contact />

      {/* Footer */}
      <footer className="py-8 px-10 lg:px-14 border-t border-white/5 text-slate-600 text-xs text-center font-body">
        Designed & built by Jeet Ratanpara · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
