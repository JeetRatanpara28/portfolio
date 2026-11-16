import { useEffect, useState } from 'react'
import About from './sections/About'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import Resume from './sections/Resume'
import Contact from './sections/Contact'

const SECTIONS = ['about', 'skills', 'projects', 'resume', 'contact']

export default function RightPanel({ panelRef, onSectionChange }) {
  // Scroll-spy: a section is "active" while it crosses a band near the middle of the scroller.
  // (Percentage thresholds fail for very tall sections on phones; a band works for any height.)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    // Desktop: the right panel scrolls. Phones/tablets: the whole page scrolls (root = viewport).
    const root = isDesktop ? panelRef?.current : null
    if (isDesktop && !root) return

    const observers = SECTIONS.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) onSectionChange(id) },
        { root, rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)

    return () => observers.forEach((o) => o.disconnect())
  }, [panelRef, onSectionChange, isDesktop])

  return (
    <div className="min-h-full max-w-5xl mx-auto">
      <About />
      <Skills />
      <Projects />
      <Resume />
      <Contact />

      {/* Footer */}
      <footer className="py-8 px-5 sm:px-8 lg:px-14 border-t border-white/5 text-slate-600 text-xs text-center font-body">
        Designed & built by Jeet Ratanpara · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
