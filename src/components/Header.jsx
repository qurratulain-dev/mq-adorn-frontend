import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { NAV_LINKS } from './navLinks.js'
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons.jsx'
import { useCart } from '../context/CartContext.jsx'

function IconButton({ label, to, children, badge }) {
  return (
    <Link to={to} aria-label={label} className="relative p-2 text-primary transition hover:text-gold">
      {children}
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-primary">
          {badge}
        </span>
      )}
    </Link>
  )
}

export default function Header() {
  const location = useLocation()
  // Menus remember the location they were opened on, so they close automatically on navigation.
  const [menuKey, setMenuKey] = useState(null)
  const [searchKey, setSearchKey] = useState(null)
  const open = menuKey === location.key
  const searchOpen = searchKey === location.key
  const setOpen = (value) => setMenuKey(value ? location.key : null)
  const toggleSearch = () => setSearchKey(searchOpen ? null : location.key)
  const { cartCount, wishlist } = useCart()

  const linkClass = (highlight) =>
    `relative py-2 text-[13px] font-medium tracking-wider uppercase transition hover:text-gold ${
      highlight ? 'text-sale' : 'text-primary'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <button
          type="button"
          className="p-2 lg:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <MenuIcon />
        </button>

        <Logo />

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            aria-label="Search"
            className="p-2 text-primary transition hover:text-gold"
            onClick={toggleSearch}
          >
            <SearchIcon />
          </button>
          <span className="hidden sm:inline-flex">
            <IconButton label="Account" to="/account">
              <UserIcon />
            </IconButton>
          </span>
          <IconButton label="Wishlist" to="/wishlist" badge={wishlist.length}>
            <HeartIcon />
          </IconButton>
          <IconButton label="Cart" to="/cart" badge={cartCount}>
            <BagIcon />
          </IconButton>
        </div>
      </div>

      <nav className="hidden border-t border-black/5 lg:block" aria-label="Main">
        <ul className="container-page flex items-center justify-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <NavLink to={link.to} className={linkClass(link.highlight)}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {searchOpen && (
        <div className="border-t border-black/5 bg-card">
          <form className="container-page flex items-center gap-3 py-3" onSubmit={(e) => e.preventDefault()}>
            <SearchIcon className="text-muted" />
            <input
              autoFocus
              type="search"
              placeholder="Search rings, necklaces, dresses…"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted"
            />
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute top-0 left-0 flex h-full w-80 max-w-[85%] flex-col bg-cream shadow-xl transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <Logo />
            <button type="button" aria-label="Close menu" className="p-2" onClick={() => setOpen(false)}>
              <CloseIcon />
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto px-5 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="border-b border-black/5">
                <NavLink to={link.to} className={`block py-3.5 ${linkClass(link.highlight)}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="border-t border-black/10 px-5 py-4">
            <Link to="/account" className="flex items-center gap-3 text-sm font-medium">
              <UserIcon /> Login / Register
            </Link>
          </div>
        </aside>
      </div>
    </header>
  )
}
