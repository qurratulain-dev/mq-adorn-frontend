import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AnnouncementBar from '../components/AnnouncementBar.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import WhatsAppFloat from '../components/WhatsAppFloat.jsx'
import CartDrawer from '../components/CartDrawer.jsx'

export default function MainLayout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return undefined
    }
    const id = hash.replace('#', '')
    const scrollToHash = () => {
      const target = document.getElementById(id)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    scrollToHash()
    const timer = window.setTimeout(scrollToHash, 450)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  )
}
