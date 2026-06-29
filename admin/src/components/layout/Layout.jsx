import { Outlet, Navigate } from 'react-router-dom'
import { auth } from '@/lib/auth'
import Sidebar from './Sidebar'
import { Toaster } from 'sonner'

export default function Layout() {
  if (!auth.isLoggedIn()) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
