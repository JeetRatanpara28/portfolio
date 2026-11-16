import { useState, useRef, useCallback } from 'react'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import MobileNav from './components/MobileNav'

export default function App() {
  const [activeSection, setActiveSection] = useState('about')
  const rightPanelRef = useRef(null)

  // Works in both layouts: scrolls the right panel on desktop, the page on phones/tablets
  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[100svh] lg:h-screen lg:overflow-hidden bg-[#050A14]">
      {/* Phones & tablets: sticky section bar */}
      <MobileNav activeSection={activeSection} onNavClick={scrollToSection} />

      {/* ── Left panel — hero on phones/tablets, 42% fixed column on desktop ── */}
      <div className="w-full h-[calc(100svh-3.25rem)] min-h-[34rem] lg:w-[42%] lg:h-full lg:min-h-0 flex-shrink-0 relative">
        <LeftPanel activeSection={activeSection} onNavClick={scrollToSection} />
      </div>

      {/* ── Right panel — page flow on phones/tablets, own scroller on desktop ── */}
      <div
        ref={rightPanelRef}
        className="flex-1 min-w-0 lg:min-h-0 lg:overflow-y-auto scroll-panel"
      >
        <RightPanel
          panelRef={rightPanelRef}
          onSectionChange={setActiveSection}
        />
      </div>
    </div>
  )
}
