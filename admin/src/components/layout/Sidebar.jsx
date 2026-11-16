import { NavLink } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { registerDevice } from '@/lib/api'
import {
  LayoutDashboard, User, Wrench, FolderKanban,
  Briefcase, GraduationCap, Award, Fingerprint, X,
} from 'lucide-react'

const NAV = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/profile',        icon: User,            label: 'Profile'         },
  { to: '/skills',         icon: Wrench,          label: 'Skills'          },
  { to: '/projects',       icon: FolderKanban,    label: 'Projects'        },
  { to: '/experience',     icon: Briefcase,       label: 'Experience'      },
  { to: '/education',      icon: GraduationCap,   label: 'Education'       },
  { to: '/certifications', icon: Award,           label: 'Certifications'  },
]

export default function Sidebar({ open = false, onClose = () => {} }) {
  return (
    <>
      {/* Backdrop for the mobile drawer */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />
    <aside
      className={cn(
        'flex flex-col bg-sidebar border-r border-sidebar-border',
        // phones & tablets: off-canvas drawer; desktop: fixed column
        'fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full',
        'lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0 lg:flex-shrink-0 lg:h-[100dvh]'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-sidebar-border">
        <span className="text-white font-bold text-sm tracking-tight">
          ⚡ Portfolio Admin
        </span>
        <button onClick={onClose} aria-label="Close menu" className="lg:hidden p-1.5 -mr-1.5 text-sidebar-foreground/70 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-white font-medium'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Add this device (Touch ID / Face ID) */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() =>
            registerDevice()
              .then(() => toast.success('This device is set up — saves will now ask for Touch ID / Face ID'))
              .catch(e => toast.error(e.message))
          }
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Fingerprint size={16} />
          Add this device
        </button>
      </div>
    </aside>
    </>
  )
}
