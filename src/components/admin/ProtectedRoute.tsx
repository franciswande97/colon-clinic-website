import { Navigate } from 'react-router';
import { useAuth } from '../../lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Not logged in → redirect to login page
  if (!session) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}