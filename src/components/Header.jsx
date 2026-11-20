import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { NAV_LINKS } from './navLinks.js'
import { BagIcon, ChevronDownIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import SearchPanel from './SearchPanel.jsx'

function IconButton({ label, to, onClick, children, badge }) {
  const className = 'relative p-2 text-primary transition hover:text-gold'
  const inner = (
    <>
      {children}
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-primary lg:bg-primary lg:text-white">
          {badge}
        </span>
      )}
    </>
  )
  if (onClick) {
    return (
      <button type="button" aria-label={label} className={className} onClick={onClick}>
        {inner}
      </button>
    )
  }
  return (
    <Link to={to} aria-label={label} className={className}>
      {inner}
    </Link>
  )
}

function navClassName(highlight, extra = '') {
  return `nav-link ${highlight ? 'text-sale hover:text-sale' : ''} ${extra}`
}

// Original mobile-menu styling (uppercase, no gold underline).
function mobileLinkClass(highlight, extra = '') {
  return `relative inline-flex items-center gap-1 py-2 text-[13px] font-medium tracking-wider uppercase transition hover:text-gold ${
    highlight ? 'text-sale' : 'text-primary'
  } ${extra}`
}

function DesktopDropdown({ link }) {
  const location = useLocation()
  const menuId = useId()
  const wrapRef = useRef(null)
  const closeTimer = useRef(null)
  // Open state is tied to the current location so the menu closes on navigation.
  const [openKey, setOpenKey] = useState(null)
  const open = openKey === location.key
  const active = `${location.pathname}${location.search}`.startsWith(link.to)

  const show = () => {
    clearTimeout(closeTimer.current)
    setOpenKey(location.key)
  }
  const hide = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenKey(null), 180)
  }
  const closeNow = () => {
    clearTimeout(closeTimer.current)
    setOpenKey(null)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeNow()
      wrapRef.current?.querySelector('[data-nav-trigger]')?.focus()
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      show()
      requestAnimationFrame(() => {
        wrapRef.current?.querySelector('[role="menuitem"]')?.focus()
      })
    }
  }

  const onBlur = (event) => {
    if (!wrapRef.current?.contains(event.relatedTarget)) closeNow()
  }

  return (
    <li
      ref={wrapRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <NavLink
        to={link.to}
        data-nav-trigger
        data-active={active || open ? 'true' : 'false'}
        className={navClassName(link.highlight)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        {link.label}
        <ChevronDownIcon className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </NavLink>
      <ul
        id={menuId}
        role="menu"
        className={`absolute top-full left-1/2 z-50 min-w-52 -translate-x-1/2 border border-black/10 bg-card py-2 shadow-[0_16px_40px_-24px_rgba(26,26,26,0.45)] transition duration-200 ease-out motion-reduce:transition-none ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible pointer-events-none -translate-y-1 opacity-0'
        }`}
      >
        <li className="absolute -top-2 right-0 left-0 h-2" aria-hidden="true" />
        {link.children.map((child) => (
          <li key={child.to} role="none">
            <NavLink
              role="menuitem"
              to={child.to}
              className="block px-5 py-2 text-[12px] tracking-wider text-primary uppercase transition hover:bg-blush hover:text-gold focus-visible:bg-blush focus-visible:text-gold focus-visible:outline-none"
            >
              {child.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </li>
  )
}

export default function Header() {
  const location = useLocation()
  // Menus remember the location they were opened on, so they close automatically on navigation.
  const [menuKey, setMenuKey] = useState(null)
  const [searchKey, setSearchKey] = useState(null)
  const [openSection, setOpenSection] = useState(null)
  const open = menuKey === location.key
  const searchOpen = searchKey === location.key
  const setOpen = (value) => setMenuKey(value ? location.key : null)
  const toggleSearch = () => setSearchKey(searchOpen ? null : location.key)
  const { cartCount, wishlist, toggleCart } = useCart()
  const { isLoggedIn } = useAuth()
  const accountTo = isLoggedIn ? '/account' : '/login'

  const icons = (
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
        <IconButton label="Account" to={accountTo}>
          <UserIcon />
        </IconButton>
      </span>
      <IconButton label="Wishlist" to="/wishlist" badge={wishlist.length}>
        <HeartIcon />
      </IconButton>
      <IconButton label="Cart" onClick={toggleCart} badge={cartCount}>
        <BagIcon />
      </IconButton>
    </div>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-4 lg:justify-start">
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

        <nav className="hidden min-w-0 flex-1 lg:block" aria-label="Main">
          <ul className="flex items-center justify-center gap-5 xl:gap-7">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <DesktopDropdown key={link.label} link={link} />
              ) : (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    data-active={
                      `${location.pathname}${location.search}` === link.to ||
                      (link.to === '/shop?sort=new' && location.search === '?sort=new')
                        ? 'true'
                        : 'false'
                    }
                    className={navClassName(link.highlight)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="ml-auto lg:ml-0">{icons}</div>
      </div>

      <SearchPanel open={searchOpen} onClose={() => setSearchKey(null)} />

      {/* Portal the drawer to document.body so header backdrop-blur does not clip position:fixed. */}
      {createPortal(
        <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setOpen(false)}
          />
          <aside
            className={`absolute top-0 left-0 flex h-full w-80 max-w-[85%] flex-col bg-cream shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
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
              {NAV_LINKS.map((link) => {
                const sectionId = `${location.key}:${link.label}`
                const expanded = openSection === sectionId
                return (
                  <li key={link.label} className="border-b border-black/5">
                    {link.children ? (
                      <>
                        <div className="flex items-center gap-1">
                          <NavLink to={link.to} className={`min-w-0 flex-1 ${mobileLinkClass(link.highlight, 'block py-3.5')}`}>
                            {link.label}
                          </NavLink>
                          <button
                            type="button"
                            className="p-2 text-primary"
                            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${link.label} menu`}
                            aria-expanded={expanded}
                            onClick={() => setOpenSection(expanded ? null : sectionId)}
                          >
                            <ChevronDownIcon className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        {expanded && (
                          <ul className="mb-2 border-l border-gold/40 pl-4">
                            {link.children.map((child) => (
                              <li key={child.to}>
                                <NavLink
                                  to={child.to}
                                  className="block py-2 text-[12px] tracking-wider text-primary/80 uppercase transition hover:text-gold"
                                >
                                  {child.label}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <NavLink to={link.to} className={`block py-3.5 ${mobileLinkClass(link.highlight)}`}>
                        {link.label}
                      </NavLink>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-black/10 px-5 py-4">
              <Link to={accountTo} className="flex items-center gap-3 text-sm font-medium">
                <UserIcon /> {isLoggedIn ? 'My account' : 'Login / Register'}
              </Link>
            </div>
          </aside>
        </div>,
        document.body,
      )}
    </header>
  )
}
