import { Routes, Route, Navigate } from 'react-router';
import HomePage from './pages/home/Home';
import BooksPage from './pages/books/Books';
import AuthGate from './pages/auth/AuthGate';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthGate />}>
        <Route element={<HomePage />}>
          <Route index element={<Navigate to="/books" replace />} />
          <Route path="books" element={<BooksPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
