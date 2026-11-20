import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Account from './pages/Account.jsx'
import AccountOrder from './pages/AccountOrder.jsx'
import Dresses from './pages/Dresses.jsx'
import NotFound from './pages/NotFound.jsx'
import About from './pages/About.jsx'
import Faqs from './pages/Faqs.jsx'
import ReturnPolicy from './pages/ReturnPolicy.jsx'
import Shipping from './pages/Shipping.jsx'
import Contact from './pages/Contact.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success/:orderNumber" element={<OrderSuccess />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="account" element={<Account />} />
        <Route path="account/orders/:orderNumber" element={<AccountOrder />} />
        <Route path="dresses" element={<Dresses />} />
        <Route path="about" element={<About />} />
        <Route path="faqs" element={<Faqs />} />
        <Route path="contact" element={<Contact />} />
        <Route path="return-policy" element={<ReturnPolicy />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="returns" element={<Navigate to="/return-policy" replace />} />
        <Route path="track-order" element={<Navigate to="/account" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
