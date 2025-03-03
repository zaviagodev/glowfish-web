import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomer } from './useCustomer';

export const useProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer } = useCustomer();

  useEffect(() => {
    // Skip check if we're already on the profile setup page
    if (location.pathname === '/auth/profile-setup') {
      return;
    }

    // Check if profile setup is required
    const isProfileSetupComplete = customer?.meta?.profile_setup_completed;
    
    if (customer && !isProfileSetupComplete) {
      // Store the current path to redirect back after profile setup
      const currentPath = location.pathname;
      navigate('/auth/profile-setup', { state: { returnTo: currentPath } });
    }
  }, [customer, location.pathname, navigate]);

  return {
    isProfileSetupComplete: customer?.meta?.profile_setup_completed ?? false,
  };
}; 