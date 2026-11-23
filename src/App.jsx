import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import BestSelling from './pages/BestSelling.jsx'
import Occasion from './pages/Occasion.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
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
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminLogin from './admin/pages/Login.jsx'
import AdminDashboard from './admin/pages/Dashboard.jsx'
import AdminOrders from './admin/pages/Orders.jsx'
import AdminOrderDetail from './admin/pages/OrderDetail.jsx'
import AdminProducts from './admin/pages/Products.jsx'
import AdminProductEdit from './admin/pages/ProductEdit.jsx'
import AdminReviews from './admin/pages/Reviews.jsx'
import AdminDeals from './admin/pages/Deals.jsx'
import AdminDealEdit from './admin/pages/DealEdit.jsx'
import AdminCustomers from './admin/pages/Customers.jsx'
import AdminSettings from './admin/pages/Settings.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminAuthProvider><Outlet /></AdminAuthProvider>}>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:orderNumber" element={<AdminOrderDetail />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductEdit />} />
        <Route path="products/:id" element={<AdminProductEdit />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="deals" element={<AdminDeals />} />
        <Route path="deals/new" element={<AdminDealEdit />} />
        <Route path="deals/:id" element={<AdminDealEdit />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      </Route>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="best-selling" element={<BestSelling />} />
        <Route path="occasion/:slug" element={<Occasion />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success/:orderNumber" element={<OrderSuccess />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="signup" element={<Signup />} />
        <Route path="account" element={<Account />} />
        <Route path="account/orders/:orderNumber" element={<AccountOrder />} />
        <Route path="dresses" element={<Dresses />} />
        <Route path="about" element={<About />} />
        <Route path="faqs" element={<Faqs />} />
        <Route path="contact" element={<Contact />} />
        <Route path="return-policy" element={<ReturnPolicy />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="returns" element={<Navigate to="/return-policy" replace />} />
        <Route path="track-order" element={<Navigate to="/account" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
