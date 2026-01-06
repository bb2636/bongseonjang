import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts";
import { ProtectedRoute, ProtectedAdminRoute } from "./components";
import { HomePageSkeleton } from "./components/HomePageSkeleton";
import "./components/ProtectedRoute/ProtectedRoute.css";

const HomePage = lazy(() => import("./features/home/pages/HomePage"));
const ProductDetailPage = lazy(() =>
  import("./features/productDetail").then((m) => ({ default: m.ProductDetailPage }))
);
const WriteInquiryPage = lazy(() => import("./features/productDetail/pages/WriteInquiryPage"));

const LoginPage = lazy(() =>
  import("./features/login").then((m) => ({ default: m.LoginPage }))
);
const EmailLoginPage = lazy(() =>
  import("./features/login").then((m) => ({ default: m.EmailLoginPage }))
);
const SocialAuthCallbackPage = lazy(() =>
  import("./features/login").then((m) => ({ default: m.SocialAuthCallbackPage }))
);
const PasswordResetRequestPage = lazy(() =>
  import("./features/login").then((m) => ({ default: m.PasswordResetRequestPage }))
);
const PasswordResetConfirmPage = lazy(() =>
  import("./features/login").then((m) => ({ default: m.PasswordResetConfirmPage }))
);

const SignupEmailPage = lazy(() =>
  import("./features/signup").then((m) => ({ default: m.SignupEmailPage }))
);
const TermsPage = lazy(() =>
  import("./features/signup").then((m) => ({ default: m.TermsPage }))
);
const PrivacyPage = lazy(() =>
  import("./features/signup").then((m) => ({ default: m.PrivacyPage }))
);
const SignupCompletePage = lazy(() =>
  import("./features/signup").then((m) => ({ default: m.SignupCompletePage }))
);

const GuestOrderLookupPage = lazy(() =>
  import("./features/orders").then((m) => ({ default: m.GuestOrderLookupPage }))
);
const GuestOrderDetailPage = lazy(() =>
  import("./features/orders").then((m) => ({ default: m.GuestOrderDetailPage }))
);

const CategoryPage = lazy(() =>
  import("./features/category/pages/CategoryPage")
);
const CategoryProductsPage = lazy(() =>
  import("./features/categoryProducts/pages/CategoryProductsPage")
);
const SearchPage = lazy(() =>
  import("./features/search/pages/SearchPage")
);

const ProfilePage = lazy(() =>
  import("./features/profile/pages/ProfilePage")
);
const ProfilePasswordVerifyPage = lazy(() =>
  import("./features/profile/pages/ProfilePasswordVerifyPage")
);
const ProfileEditPage = lazy(() =>
  import("./features/profile/pages/ProfileEditPage")
);
const ProfileWithdrawPage = lazy(() =>
  import("./features/profile/pages/ProfileWithdrawPage")
);

const PointPage = lazy(() =>
  import("./features/point").then((m) => ({ default: m.PointPage }))
);
const MyCouponPage = lazy(() =>
  import("./features/coupon").then((m) => ({ default: m.MyCouponPage }))
);
const CouponDownloadPage = lazy(() =>
  import("./features/coupon").then((m) => ({ default: m.CouponDownloadPage }))
);
const WishlistPage = lazy(() =>
  import("./features/wishlist").then((m) => ({ default: m.WishlistPage }))
);

const OrderHistoryPage = lazy(() =>
  import("./features/orderHistory/pages/OrderHistoryPage").then((m) => ({
    default: m.OrderHistoryPage,
  }))
);
const InProgressOrdersPage = lazy(() =>
  import("./features/orderHistory/pages/InProgressOrdersPage").then((m) => ({
    default: m.InProgressOrdersPage,
  }))
);
const OrderDetailPage = lazy(() =>
  import("./features/orderDetail").then((m) => ({ default: m.OrderDetailPage }))
);
const PaymentCompletePage = lazy(() =>
  import("./features/orderDetail").then((m) => ({ default: m.PaymentCompletePage }))
);

const CartPage = lazy(() =>
  import("./features/cart/pages/CartPage").then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import("./features/payment/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage }))
);
const GuestCheckoutPage = lazy(() =>
  import("./features/payment/pages/GuestCheckoutPage").then((m) => ({
    default: m.GuestCheckoutPage,
  }))
);
const PaymentSuccessPage = lazy(() =>
  import("./features/payment/pages/PaymentSuccessPage").then((m) => ({
    default: m.PaymentSuccessPage,
  }))
);
const PaymentFailPage = lazy(() =>
  import("./features/payment/pages/PaymentFailPage").then((m) => ({
    default: m.PaymentFailPage,
  }))
);
const PaymentSuccessDemoPage = lazy(() =>
  import("./features/payment/pages/PaymentSuccessDemoPage").then((m) => ({
    default: m.PaymentSuccessDemoPage,
  }))
);

const NoticeListPage = lazy(() =>
  import("./features/notice").then((m) => ({ default: m.NoticeListPage }))
);
const NoticeDetailPage = lazy(() =>
  import("./features/notice").then((m) => ({ default: m.NoticeDetailPage }))
);
const InvestmentInfoListPage = lazy(() =>
  import("./features/investmentInfo").then((m) => ({ default: m.InvestmentInfoListPage }))
);
const InvestmentInfoDetailPage = lazy(() =>
  import("./features/investmentInfo").then((m) => ({ default: m.InvestmentInfoDetailPage }))
);
const AddressFormPage = lazy(() =>
  import("./features/address").then((m) => ({ default: m.AddressFormPage }))
);
const WriteReviewPage = lazy(() =>
  import("./features/review").then((m) => ({ default: m.WriteReviewPage }))
);
const ReviewListPage = lazy(() =>
  import("./features/review").then((m) => ({ default: m.ReviewListPage }))
);
const FaqPage = lazy(() =>
  import("./features/faq").then((m) => ({ default: m.FaqPage }))
);
const MyInquiriesPage = lazy(() =>
  import("./features/myInquiries").then((m) => ({ default: m.MyInquiriesPage }))
);
const BongseonStoryPage = lazy(() =>
  import("./features/about").then((m) => ({ default: m.BongseonStoryPage }))
);
const TermsViewPage = lazy(() =>
  import("./features/terms").then((m) => ({ default: m.TermsViewPage }))
);
const EventDetailPage = lazy(() =>
  import("./features/event").then((m) => ({ default: m.EventDetailPage }))
);

const BrandProductsPage = lazy(() =>
  import("./features/brandProducts").then((m) => ({ default: m.BrandProductsPage }))
);

const AdminLoginPage = lazy(() =>
  import("./features/admin").then((m) => ({ default: m.AdminLoginPage }))
);
const AdminPlaceholderPage = lazy(() =>
  import("./features/admin").then((m) => ({ default: m.AdminPlaceholderPage }))
);
const AdminSupportPage = lazy(() =>
  import("./features/admin").then((m) => ({ default: m.AdminSupportPage }))
);
const BannerManagementPage = lazy(() =>
  import("./features/admin").then((m) => ({ default: m.BannerManagementPage }))
);
const CouponManagementPage = lazy(() =>
  import("./features/admin").then((m) => ({ default: m.CouponManagementPage }))
);
const OrderManagementPage = lazy(() =>
  import("./features/admin").then((m) => ({ default: m.OrderManagementPage }))
);
const ProductManagementPage = lazy(() =>
  import("./features/admin").then((m) => ({ default: m.ProductManagementPage }))
);
const TermsManagementPage = lazy(() =>
  import("./features/admin").then((m) => ({ default: m.TermsManagementPage }))
);
const UserManagementPage = lazy(() =>
  import("./features/admin").then((m) => ({ default: m.UserManagementPage }))
);

function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #f3f3f3",
          borderTop: "3px solid #3B9BD5",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={
          <Suspense fallback={<HomePageSkeleton />}>
            <HomePage />
          </Suspense>
        } />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route
          path="/product/:productId/inquiry/write"
          element={
            <ProtectedRoute>
              <WriteInquiryPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/email" element={<EmailLoginPage />} />
        <Route path="/login/password-reset" element={<PasswordResetRequestPage />} />
        <Route path="/login/password-reset/confirm" element={<PasswordResetConfirmPage />} />
        <Route
          path="/oauth/:provider/callback"
          element={<SocialAuthCallbackPage />}
        />
        <Route path="/signup/email" element={<SignupEmailPage />} />
        <Route path="/signup/complete" element={<SignupCompletePage />} />
        <Route path="/signup/terms" element={<TermsPage />} />
        <Route path="/signup/privacy" element={<PrivacyPage />} />
        <Route path="/orders/guest" element={<GuestOrderLookupPage />} />
        <Route path="/orders/guest/:orderId" element={<GuestOrderDetailPage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/category/:slug" element={<CategoryProductsPage />} />
        <Route path="/brand/:brandId" element={<BrandProductsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/profile/verify"
          element={
            <ProtectedRoute>
              <ProfilePasswordVerifyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/withdraw"
          element={
            <ProtectedRoute>
              <ProfileWithdrawPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/points"
          element={
            <ProtectedRoute>
              <PointPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupons"
          element={
            <ProtectedRoute>
              <MyCouponPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupons/download"
          element={
            <ProtectedRoute>
              <CouponDownloadPage />
            </ProtectedRoute>
          }
        />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/in-progress"
          element={
            <ProtectedRoute>
              <InProgressOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/complete/:orderId"
          element={<PaymentCompletePage />}
        />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/guest" element={<GuestCheckoutPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/success/demo" element={<PaymentSuccessDemoPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
        <Route path="/notice" element={<NoticeListPage />} />
        <Route path="/notice/:id" element={<NoticeDetailPage />} />
        <Route path="/investment-info" element={<InvestmentInfoListPage />} />
        <Route path="/investment-info/:id" element={<InvestmentInfoDetailPage />} />
        <Route
          path="/address/add"
          element={
            <ProtectedRoute>
              <AddressFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/address/edit/:id"
          element={
            <ProtectedRoute>
              <AddressFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/write/:productId"
          element={
            <ProtectedRoute>
              <WriteReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <ReviewListPage />
            </ProtectedRoute>
          }
        />
        <Route path="/faq" element={<FaqPage />} />
        <Route
          path="/my-inquiries"
          element={
            <ProtectedRoute>
              <MyInquiriesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<BongseonStoryPage />} />
        <Route path="/terms" element={<TermsViewPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<ProtectedAdminRoute><Navigate to="/admin/users" replace /></ProtectedAdminRoute>} />
        <Route path="/admin/products" element={<ProtectedAdminRoute><ProductManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/products/*" element={<ProtectedAdminRoute><ProductManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/orders" element={<ProtectedAdminRoute><OrderManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/orders/*" element={<ProtectedAdminRoute><OrderManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/users" element={<ProtectedAdminRoute><UserManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/users/*" element={<ProtectedAdminRoute><UserManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/reviews" element={<ProtectedAdminRoute><AdminPlaceholderPage /></ProtectedAdminRoute>} />
        <Route path="/admin/reviews/*" element={<ProtectedAdminRoute><AdminPlaceholderPage /></ProtectedAdminRoute>} />
        <Route path="/admin/coupons" element={<ProtectedAdminRoute><CouponManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/coupons/*" element={<ProtectedAdminRoute><CouponManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/banners" element={<ProtectedAdminRoute><BannerManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/banners/*" element={<ProtectedAdminRoute><BannerManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/categories" element={<ProtectedAdminRoute><AdminPlaceholderPage /></ProtectedAdminRoute>} />
        <Route path="/admin/categories/*" element={<ProtectedAdminRoute><AdminPlaceholderPage /></ProtectedAdminRoute>} />
        <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminPlaceholderPage /></ProtectedAdminRoute>} />
        <Route path="/admin/settings/*" element={<ProtectedAdminRoute><AdminPlaceholderPage /></ProtectedAdminRoute>} />
        <Route path="/admin/support" element={<ProtectedAdminRoute><AdminSupportPage /></ProtectedAdminRoute>} />
        <Route path="/admin/support/*" element={<ProtectedAdminRoute><AdminSupportPage /></ProtectedAdminRoute>} />
        <Route path="/admin/terms" element={<ProtectedAdminRoute><TermsManagementPage /></ProtectedAdminRoute>} />
        <Route path="/admin/terms/*" element={<ProtectedAdminRoute><TermsManagementPage /></ProtectedAdminRoute>} />

        <Route
          path="*"
          element={
            <MainLayout>
              <div style={{ padding: "80px 16px 16px" }}>
                페이지를 찾을 수 없습니다
              </div>
            </MainLayout>
          }
        />
      </Routes>
    </Suspense>
  );
}
