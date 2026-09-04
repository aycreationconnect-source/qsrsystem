import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const PublicOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthLoading } = useApp();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#faf8f5] dark:bg-[#0c0f17]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-stone-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};
