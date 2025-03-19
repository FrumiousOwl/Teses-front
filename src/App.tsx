import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthenticationImage />} />
          {/* Redirect root path to a default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login route */}
          <Route path="/login" element={<AuthenticationImage />} />

          {/* Dashboard routes */}
          <Route path="/dashboard" element={<NavbarSegmented />}>
            <Route index element={<Navigate to="srrf" replace />} /> {/* Default nested route */}
            <Route path="srrf" element={<SRRFForm />} />
            <Route path="hardwareRequest" element={<SRRFFormForUser />} />
            <Route path="input-assets" element={<InputAssetsForm />} />
            <Route path="available-assets" element={<AvailableAssetsForm />} />
            <Route path="defective-assets" element={<DefectiveAssetsForm onSelectAsset={() => { /* implementation here */ }} />} />
            <Route path="report" element={<Report />} />
            <Route path="warning-stock" element={<WarningStock />} /> 
            <Route path="/dashboard/anomaly" element={<Anomaly />} />
            <Route path = "/dashboard/change-password" element={<ChangePassword />}/>
            <Route path="warning-stock" element={<WarningStock />} />
            <Route path="anomaly" element={<Anomaly />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Fallback route for unmatched paths */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}