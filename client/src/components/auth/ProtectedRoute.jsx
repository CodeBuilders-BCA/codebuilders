import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Assuming you store 'admin' or 'user'

  // 1. If no token, redirect to Login
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // 2. If roles are specified (e.g., Admin only) and user doesn't match
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // Redirect unauthorized users to Home
  }

  // 3. If okay, render the child route
  return <Outlet />;
};

export default ProtectedRoute;