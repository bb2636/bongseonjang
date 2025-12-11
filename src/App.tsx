import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts';
import HomePage from './features/home/pages/HomePage';
import { LoginPage, EmailLoginPage } from './features/login';
import { SignupEmailPage, TermsPage, PrivacyPage, SignupCompletePage } from './features/signup';
import { GuestOrderLookupPage } from './features/orders';
import { ProductDetailPage } from './features/productDetail';
import { CategoryPage } from './features/category';
import { CategoryProductsPage } from './features/categoryProducts';
import { SearchPage } from './features/search';
import { ProfilePage } from './features/profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/email" element={<EmailLoginPage />} />
      <Route path="/signup/email" element={<SignupEmailPage />} />
      <Route path="/signup/complete" element={<SignupCompletePage />} />
      <Route path="/signup/terms" element={<TermsPage />} />
      <Route path="/signup/privacy" element={<PrivacyPage />} />
      <Route path="/orders/guest" element={<GuestOrderLookupPage />} />
      <Route path="/category" element={<CategoryPage />} />
      <Route path="/category/:slug" element={<CategoryProductsPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<ProfilePage />} />
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
