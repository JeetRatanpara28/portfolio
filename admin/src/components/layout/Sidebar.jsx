import { NavLink, useNavigate } from 'react-router-dom'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, User, Wrench, FolderKanban,
  Briefcase, GraduationCap, Award, LogOut, Settings,
} from 'lucide-react'

const NAV = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/profile',        icon: User,            label: 'Profile'         },
  { to: '/skills',         icon: Wrench,          label: 'Skills'          },
  { to: '/projects',       icon: FolderKanban,    label: 'Projects'        },
  { to: '/experience',     icon: Briefcase,       label: 'Experience'      },
  { to: '/education',      icon: GraduationCap,   label: 'Education'       },
  { to: '/certifications', icon: Award,           label: 'Certifications'  },
  { to: '/settings',       icon: Settings,        label: 'Settings'        },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const logout = () => {
    auth.clearToken()
    navigate('/login')
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
        <span className="text-white font-bold text-sm tracking-tight">
          ⚡ Portfolio Admin
        </span>
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
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
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

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:text-red-400 hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}
