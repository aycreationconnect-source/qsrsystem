import React from 'react';
import { ActivateLicenseView } from './ActivateLicenseView';
import { useApp } from '../../context/AppContext';

export const RegisterView: React.FC = () => {
  const { checkLicenseStatus } = useApp();
  return <ActivateLicenseView onActivationSuccess={checkLicenseStatus} />;
};
export default RegisterView;
