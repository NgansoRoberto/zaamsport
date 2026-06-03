import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
        Chargement...
      </div>
    );
  }
  if (!user) return <Navigate to="/connexion" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
