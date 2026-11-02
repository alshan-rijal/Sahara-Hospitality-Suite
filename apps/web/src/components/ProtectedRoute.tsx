import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <span>Preparing your workspace…</span>
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
