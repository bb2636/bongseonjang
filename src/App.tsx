import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts';
import HomePage from './features/home/pages/HomePage';
import { LoginPage, EmailLoginPage, SocialAuthCallbackPage } from './features/login';
import { SignupEmailPage, TermsPage, PrivacyPage, SignupCompletePage } from './features/signup';
import { GuestOrderLookupPage } from './features/orders';
import { ProductDetailPage } from './features/productDetail';
import { CategoryPage } from './features/category';
import { CategoryProductsPage } from './features/categoryProducts';
import { SearchPage } from './features/search';
import { ProfilePage } from './features/profile';
import { PointPage } from './features/point';
import { ProtectedRoute } from './components';
import './components/ProtectedRoute/ProtectedRoute.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/email" element={<EmailLoginPage />} />
      <Route path="/auth/callback/:provider" element={<SocialAuthCallbackPage />} />
      <Route path="/signup/email" element={<SignupEmailPage />} />
      <Route path="/signup/complete" element={<SignupCompletePage />} />
      <Route path="/signup/terms" element={<TermsPage />} />
      <Route path="/signup/privacy" element={<PrivacyPage />} />
      <Route path="/orders/guest" element={<GuestOrderLookupPage />} />
      <Route path="/category" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
      <Route path="/category/:slug" element={<ProtectedRoute><CategoryProductsPage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/points" element={<ProtectedRoute><PointPage /></ProtectedRoute>} />
      <Route
        path="*"
        element={
          <MainLayout>
            <div style={{ padding: '80px 16px 16px' }}>페이지를 찾을 수 없습니다</div>
          </MainLayout>
        }
      />
    </Routes>
  );
}
