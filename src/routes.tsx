import { Routes, Route, Navigate } from 'react-router';
import HomePage from './pages/home/Home';
import BooksPage from './pages/books/Books';
import AuthGate from './pages/auth/AuthGate';
import LoginPage from './pages/auth/Login';
import NotFoundPage from './pages/NotFound';
import AuthorsPage from './pages/authors/Authors';
import UnauthorizedPage from './pages/Unauthorized';
import { ROUTES } from './constants';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route element={<AuthGate />}>
        <Route element={<HomePage />}>
          <Route index element={<Navigate to={ROUTES.books} replace />} />
          <Route path={ROUTES.books} element={<BooksPage />} />
          <Route path={ROUTES.authors} element={<AuthorsPage />} />
        </Route>
      </Route>
      <Route path={ROUTES.unauthorized} element={<UnauthorizedPage />} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
