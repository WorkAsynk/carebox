import React from 'react';
import { useSelector } from 'react-redux';
import Login from '../pages/Login';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const user = useSelector((state) => state.auth?.user);

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <Login />;
  }

  // If no roles specified, allow all authenticated users
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in the allowed roles
  const userRole = user?.role;
  const hasAccess = allowedRoles.includes(userRole);

  // If user doesn't have required role, show access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Required role not found.
          </p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>Current user: <span className="font-medium">{user?.name || 'Unknown'}</span></p>
            <p>Your role: <span className="font-medium">{userRole || 'No role assigned'}</span></p>
            <p>Required roles: <span className="font-medium">{allowedRoles.join(', ')}</span></p>
          </div>
          <div className="mt-6">
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user has required role, render the children
  return children;
};

export default ProtectedRoute;
