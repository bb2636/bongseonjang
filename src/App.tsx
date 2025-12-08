import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts';
import HomePage from './features/home/pages/HomePage';
import { LoginPage, EmailLoginPage } from './features/auth';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/email" element={<EmailLoginPage />} />
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
