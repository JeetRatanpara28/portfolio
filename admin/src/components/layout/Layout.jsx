import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { Toaster } from 'sonner'

export default function Layout() {
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  // close the mobile drawer after navigating
  useEffect(() => { setNavOpen(false) }, [pathname])

  // Escape closes it; lock page scroll behind the open drawer
  useEffect(() => {
    if (!navOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setNavOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [navOpen])

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar — phones & tablets only */}
        <header className="lg:hidden flex-shrink-0 h-14 flex items-center gap-3 px-4 border-b border-border bg-card">
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="p-2 -ml-2 rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm tracking-tight">⚡ Portfolio Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster richColors position="top-center" />
    </div>
  )
}
