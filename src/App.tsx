import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthenticationImage } from './components/AuthenticationImage';
import { NavbarSegmented } from './components/NavbarSegmented';
import SRRFForm from './components/SRRFForm';
import InputAssetsForm from './components/InputAssetsForm';
import AvailableAssetsForm from './components/AvailableAssetsForm';
import DefectiveAssetsForm from './components/DefectiveAssetsForm';
import Report from './components/Report';
import WarningStock from './components/WarningStock';
import Anomaly from './components/Anomaly';
import SRRFFormForUser from './components/SRRFFormForUser';
import ChangePassword from './components/ChangePassword';
import Register from './components/Register';
import UserAccount from './components/UserAccount';
import ResetPassword from './components/ResetPass';
import UserEmail from './components/UserEmail';

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <MantineProvider>
      <Notifications position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthenticationImage />} />
          <Route element={<ProtectedRoute />}>

            <Route path="/dashboard" element={<NavbarSegmented />}>
              <Route index element={<Navigate to="srrf" replace />} />
              <Route path="srrf" element={<SRRFForm />} />
              <Route path="hardwareRequest" element={<SRRFFormForUser />} />
              <Route path="input-assets" element={<InputAssetsForm />} />
              <Route path="available-assets" element={<AvailableAssetsForm />} />
              <Route path="defective-assets" element={<DefectiveAssetsForm />} />
              <Route path="report" element={<Report />} />
              <Route path="warning-stock" element={<WarningStock />} />
              <Route path="anomaly" element={<Anomaly />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="register" element={<Register />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="user-account" element={<UserAccount />} />
              <Route path="user-email" element={<UserEmail />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </MantineProvider>
  );
}