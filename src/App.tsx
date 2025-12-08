import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts';
import HomePage from './features/home/pages/HomePage';

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </MainLayout>
  );
}
