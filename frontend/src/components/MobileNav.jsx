import { useEffect, useRef } from 'react'
import { NAV } from './LeftPanel'

/** Sticky top bar for phones & tablets (the desktop card nav is hidden below lg). */
export default function MobileNav({ activeSection, onNavClick }) {
  const navRef = useRef(null)

  // keep the active pill visible inside the horizontally scrolling bar
  useEffect(() => {
    const nav = navRef.current
    const el = nav?.querySelector('[data-active="true"]')
    if (nav && el) nav.scrollTo({ left: el.offsetLeft - (nav.clientWidth - el.clientWidth) / 2, behavior: 'smooth' })
  }, [activeSection])

  return (
    <header className="lg:hidden sticky top-0 z-40 h-[3.25rem] flex items-center gap-2 px-3 bg-[#050A14]/85 backdrop-blur-md border-b border-white/10">
      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#64DCFF] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white font-display">
        JR
      </span>
      <nav ref={navRef} className="relative flex-1 min-w-0 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map((item) => {
          const active = activeSection === item.id
          return (
            <button
              key={item.id}
              data-active={active}
              onClick={() => onNavClick(item.id)}
              className={`flex-shrink-0 px-3 h-9 rounded-full text-sm font-medium font-display transition-colors ${
                active ? 'bg-[#64DCFF]/15 text-[#64DCFF]' : 'text-slate-400 active:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
