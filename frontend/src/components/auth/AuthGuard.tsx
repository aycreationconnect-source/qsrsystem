import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../api/authApi';

export const AuthGuard: React.FC = () => {
  const { currentUser, setCurrentUser, isAuthLoading, licenseStatus } = useApp();
  const location = useLocation();

  // Authenticate JWT on each route transition in background
  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      try {
        const profile = await authApi.getProfile();
        if (!profile || !profile.sub) {
          throw new Error('Invalid token');
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
          localStorage.removeItem('pos_current_user');
          localStorage.removeItem('pos_jwt_token');
        }
      }
    };

    if (currentUser) {
      verifyToken();
    }

    return () => {
      isMounted = false;
    };
  }, [location.pathname, location.search, currentUser, setCurrentUser]);

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#faf8f5] dark:bg-[#0c0f17]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-stone-500">Checking system status...</span>
        </div>
      </div>
    );
  }

  // If store is not activated, redirect to activation screen
  if (!licenseStatus) {
    return <Navigate to="/activate" replace />;
  }

  // If user is not logged in, redirect to login with redirect path
  if (!currentUser) {
    const redirectUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  return <Outlet />;
};
