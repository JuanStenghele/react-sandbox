import { Outlet, Navigate } from 'react-router';
import { ROUTES } from '../../constants';
import { useAuth } from 'react-oidc-context';
import LoadingPage from '../Loading';
import { useSnackbar } from 'notistack';

const AuthGate = () => {
  const auth = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  if (auth.error) {
    enqueueSnackbar(`Authentication error: ${auth.error.message}`, {
      variant: 'error'
    });
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
