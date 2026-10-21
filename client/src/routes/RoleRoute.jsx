import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SplashScreen } from '../components/loaders/SplashScreen';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    const fallback =
      user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/student';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default RoleRoute;
