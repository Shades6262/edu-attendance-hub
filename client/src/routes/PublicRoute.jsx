import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SplashScreen } from '../components/loaders/SplashScreen';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (user) {
    const fallback =
      user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/student';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default PublicRoute;
