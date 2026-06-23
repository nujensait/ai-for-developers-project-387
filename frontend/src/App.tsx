import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import BookingPage from '@/pages/BookingPage';
import AdminPage from '@/pages/AdminPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking/:eventTypeId" element={<BookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
