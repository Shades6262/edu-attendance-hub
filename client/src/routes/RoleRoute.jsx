import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    // logged in, but wrong role for this route — send them to their own dashboard
    // instead of back to login, since login would be a confusing dead end
    const fallback =
      user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/student';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default RoleRoute;