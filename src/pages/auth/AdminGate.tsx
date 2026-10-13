import { Navigate, Outlet } from 'react-router';
import { ROUTES, adminPermission } from '../../constants';
import { useHasPermission } from '../../services/auth';

const AdminGate = () => {
  const isAdmin = useHasPermission(adminPermission);

  if (isAdmin) {
    return <Outlet />;
  }

  return <Navigate to={ROUTES.unauthorized} replace />;
};
  
export default AdminGate;
