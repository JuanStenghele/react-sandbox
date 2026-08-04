import { Routes, Route, Navigate } from 'react-router';
import HomePage from './pages/home/Home';
import BooksPage from './pages/books/Books';
import AuthGate from './pages/auth/AuthGate';
import LoginPage from './pages/auth/Login';
import NotFoundPage from './pages/NotFound';
import AuthorsPage from './pages/authors/Authors';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='login' element={<LoginPage />} />
      <Route element={<AuthGate />}>
        <Route element={<HomePage />}>
          <Route index element={<Navigate to='/books' replace />} />
          <Route path='books' element={<BooksPage />} />
          <Route path='authors' element={<AuthorsPage />} />
        </Route>
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
