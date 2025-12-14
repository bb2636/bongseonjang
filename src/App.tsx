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
import { ProfilePage, ProfilePasswordVerifyPage, ProfileEditPage, ProfileWithdrawPage } from './features/profile';
import { PointPage } from './features/point';
import { MyCouponPage, CouponDownloadPage } from './features/coupon';
import { WishlistPage } from './features/wishlist';
import { OrderHistoryPage } from './features/orderHistory/pages/OrderHistoryPage';
import { InProgressOrdersPage } from './features/orderHistory/pages/InProgressOrdersPage';
import { OrderDetailPage, PaymentCompletePage } from './features/orderDetail';
import { CartPage } from './features/cart/pages/CartPage';
import { CheckoutPage } from './features/payment/pages/CheckoutPage';
import { PaymentSuccessPage } from './features/payment/pages/PaymentSuccessPage';
import { PaymentFailPage } from './features/payment/pages/PaymentFailPage';
import { NoticeListPage } from './features/notice';
import { AddressFormPage } from './features/address';
import { WriteReviewPage } from './features/review';
import { ProtectedRoute } from './components';
import './components/ProtectedRoute/ProtectedRoute.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/email" element={<EmailLoginPage />} />
      <Route path="/oauth/:provider/callback" element={<SocialAuthCallbackPage />} />
      <Route path="/signup/email" element={<SignupEmailPage />} />
      <Route path="/signup/complete" element={<SignupCompletePage />} />
      <Route path="/signup/terms" element={<TermsPage />} />
      <Route path="/signup/privacy" element={<PrivacyPage />} />
      <Route path="/orders/guest" element={<GuestOrderLookupPage />} />
      <Route path="/category" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
      <Route path="/category/:slug" element={<ProtectedRoute><CategoryProductsPage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/verify" element={<ProtectedRoute><ProfilePasswordVerifyPage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
      <Route path="/profile/withdraw" element={<ProtectedRoute><ProfileWithdrawPage /></ProtectedRoute>} />
      <Route path="/points" element={<ProtectedRoute><PointPage /></ProtectedRoute>} />
      <Route path="/coupons" element={<ProtectedRoute><MyCouponPage /></ProtectedRoute>} />
      <Route path="/coupons/download" element={<ProtectedRoute><CouponDownloadPage /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
      <Route path="/orders/in-progress" element={<ProtectedRoute><InProgressOrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/payment/complete/:orderId" element={<PaymentCompletePage />} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/fail" element={<PaymentFailPage />} />
      <Route path="/notice" element={<ProtectedRoute><NoticeListPage /></ProtectedRoute>} />
      <Route path="/address/add" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
      <Route path="/address/edit/:id" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
      <Route path="/review/write/:productId" element={<ProtectedRoute><WriteReviewPage /></ProtectedRoute>} />
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
