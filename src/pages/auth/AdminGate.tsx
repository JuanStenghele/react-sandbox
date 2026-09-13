import { Navigate, Outlet } from 'react-router';
import { ROUTES, adminScope } from '../../constants';
import { useAuth } from 'react-oidc-context';

const AdminGate = () => {
  const auth = useAuth();

  const scopes = auth.user?.scope?.split(' ') ?? [];

  if (scopes.includes(adminScope)) {
    return <Outlet />;
  }

  return <Navigate to={ROUTES.unauthorized} replace />;
};
  
export default AdminGate;
