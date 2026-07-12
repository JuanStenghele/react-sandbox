import { Outlet } from 'react-router';
import { useAuth } from 'react-oidc-context';
import SignInPage from './SignIn';
import LoadingPage from '../Loading';

const AuthGate = () => {
  const auth = useAuth();

  if (auth.error) {
    // Show toast with error message auth.error.source, auth.error.message
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
    <SignInPage />
  );
};

export default AuthGate;
