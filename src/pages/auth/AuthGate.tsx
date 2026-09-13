import { Outlet, Navigate } from 'react-router';
import { ROUTES } from '../../constants';
import { useAuth } from 'react-oidc-context';
import LoadingPage from '../Loading';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const AuthGate = () => {
  const auth = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  if (auth.error) {
    enqueueSnackbar(t('errors.authenticationError', { message: auth.error.message }), {
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
