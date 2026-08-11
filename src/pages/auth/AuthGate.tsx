import { Outlet, Navigate } from 'react-router';
import { ROUTES } from '../../constants';
import { useAuth } from 'react-oidc-context';
import LoadingPage from '../Loading';

const AuthGate = () => {
  const auth = useAuth();

  if (auth.error) {
    // TODO: Show toast with error message auth.error.source, auth.error.message
  }

  if (auth.isLoading) {
    return (
      <LoadingPage />
    );
  }

  if (auth.isAuthenticated) {
    return ( 
      <Outlet />
    );
  }

  return (
    <Navigate to={ROUTES.login} replace />
  );
};

export default AuthGate;
