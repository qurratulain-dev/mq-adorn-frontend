import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/deals', label: 'Deals' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/settings', label: 'Settings' },
]

function IconMenu({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  )
}

export default function AdminLayout() {
  const { isLoggedIn, loading, admin, logout } = useAdminAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-muted">Loading admin…</div>
  }
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  const onLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const nav = (
    <nav className="flex flex-col gap-1 p-4">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            `rounded-sm px-3 py-2 text-sm transition ${isActive ? 'bg-gold text-white' : 'hover:bg-blush'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-cream text-primary">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-black/5 bg-card md:flex md:flex-col">
        <div className="border-b border-black/5 px-5 py-5">
          <p className="font-heading text-xl">MQ Adorn</p>
          <p className="mt-1 text-[11px] tracking-[0.18em] text-muted uppercase">Admin</p>
        </div>
        {nav}
        <div className="mt-auto border-t border-black/5 p-4 text-xs text-muted">
          <p className="truncate">{admin?.email}</p>
          <button type="button" className="mt-2 underline decoration-gold underline-offset-2 hover:text-gold" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-card shadow-xl motion-safe:transition-transform">
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <p className="font-heading text-xl">MQ Adorn</p>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><IconMenu open /></button>
            </div>
            {nav}
            <div className="mt-auto border-t border-black/5 p-4 text-xs text-muted">
              <p className="truncate">{admin?.email}</p>
              <button type="button" className="mt-2 underline decoration-gold underline-offset-2 hover:text-gold" onClick={onLogout}>Log out</button>
            </div>
          </aside>
        </div>
      )}

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-card/95 px-4 py-3 backdrop-blur md:px-8">
          <button type="button" className="md:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <IconMenu />
          </button>
          <p className="font-heading text-lg md:hidden">Admin</p>
          <Link to="/" className="text-xs tracking-wide text-muted uppercase hover:text-gold">View shop</Link>
        </header>
        <main className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
