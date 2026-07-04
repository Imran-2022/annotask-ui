'use client';

import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Custom hook to require authentication
 * Redirects to login if user is not authenticated
 */
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
};

/**
 * Custom hook to prevent authenticated users from accessing pages
 * (like login/register pages)
 */
export const usePreventAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tasks');
    }
  }, [isAuthenticated, navigate]);
};
