import { useState, useRef, useCallback } from 'react'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'

export default function App() {
  const [activeSection, setActiveSection] = useState('about')
  const rightPanelRef = useRef(null)

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id)
    if (el && rightPanelRef.current) {
      rightPanelRef.current.scrollTo({
        top: el.offsetTop,
        behavior: 'smooth',
      })
    }
  }, [])

  return (
    <div className="flex flex-col lg:flex-row w-screen h-screen overflow-hidden bg-[#050A14]">
      {/* ── Left panel — 42% on lg+, 45vh on mobile ── */}
      <div className="w-full h-[45vh] lg:w-[42%] lg:h-full flex-shrink-0 relative">
        <LeftPanel activeSection={activeSection} onNavClick={scrollToSection} />
      </div>

      {/* ── Right panel — scrollable ── */}
      <div
        ref={rightPanelRef}
        className="flex-1 min-h-0 overflow-y-auto scroll-panel"
      >
        <RightPanel
          panelRef={rightPanelRef}
          onSectionChange={setActiveSection}
        />
      </div>
    </div>
  )
}
