import { Routes, Route, Navigate } from 'react-router';
import HomePage from './pages/home/Home';
import BooksPage from './pages/books/Books';
import AuthGate from './pages/auth/AuthGate';
import LoginPage from './pages/auth/Login';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='login' element={<LoginPage />} />
      <Route element={<AuthGate />}>
        <Route element={<HomePage />}>
          <Route index element={<Navigate to='/books' replace />} />
          <Route path='books' element={<BooksPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
