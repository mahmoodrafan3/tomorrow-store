import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import { useEffect, useRef } from 'react';

import Home          from './pages/Home';
import Shop          from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Profile       from './pages/Profile';
import Checkout      from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin     from './pages/AdminLogin';

import EditProfile    from './pages/profile/EditProfile';
import Addresses      from './pages/profile/Addresses';
import Language       from './pages/profile/Language';
import Notifications  from './pages/profile/Notifications';
import PrivacyCentre  from './pages/profile/PrivacyCentre';
import Faqs           from './pages/profile/Faqs';
import Terms          from './pages/profile/Terms';

function PageTransition({ children }) {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPathRef.current = location.pathname;
      return;
    }

    // Only re-render when navigating to a different route
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/shop"       element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/profile"    element={<Profile />} />
        {/* Account settings sub-pages */}
        <Route path="/profile/settings"      element={<EditProfile />} />
        <Route path="/profile/addresses"     element={<Addresses />} />
        <Route path="/profile/language"      element={<Language />} />
        <Route path="/profile/notifications" element={<Notifications />} />
        <Route path="/profile/privacy"       element={<PrivacyCentre />} />
        <Route path="/profile/terms"         element={<Terms />} />
        <Route path="/profile/faqs"          element={<Faqs />} />
        <Route path="/checkout"   element={<Checkout />} />
        {/* Separate admin portal — not reachable from the storefront login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin"       element={<AdminDashboard />} />
        <Route path="*"           element={<NotFound />} />
      </Routes>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--black)', color: 'var(--cream)', gap: '1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 15vw, 10rem)', fontWeight: 900, opacity: 0.1 }}>404</h1>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontStyle: 'italic', color: 'rgba(245,240,232,0.5)' }}>This page doesn't exist yet.</p>
      <a href="/" className="btn btn-cream" style={{ padding: '0.85rem 2rem', fontSize: '0.78rem' }}>Back to Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'var(--font-sans)', fontSize: '0.88rem' },
            }}
          />
        </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
