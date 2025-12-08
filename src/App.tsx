import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts';
import HomePage from './features/home/pages/HomePage';
import { LoginPage, EmailLoginPage } from './features/login';
import { SignupEmailPage, TermsPage, PrivacyPage, SignupCompletePage } from './features/signup';
import { GuestOrderLookupPage } from './features/orders';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/email" element={<EmailLoginPage />} />
      <Route path="/signup/email" element={<SignupEmailPage />} />
      <Route path="/signup/complete" element={<SignupCompletePage />} />
      <Route path="/signup/terms" element={<TermsPage />} />
      <Route path="/signup/privacy" element={<PrivacyPage />} />
      <Route path="/orders/guest" element={<GuestOrderLookupPage />} />
      <Route
        path="/*"
        element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </MainLayout>
        }
      />
    </Routes>
  );
}
