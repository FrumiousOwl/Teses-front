import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthenticationImage } from './components/AuthenticationImage';
import { NavbarSegmented } from './components/NavbarSegmented';
import SRRFForm from './components/SRRFForm';
import InputAssetsForm from './components/InputAssetsForm';
import AvailableAssetsForm from './components/AvailableAssetsForm';
import DefectiveAssetsForm from './components/DefectiveAssetsForm';
import Report from './components/Report';
import WarningStock from './components/WarningStock'; // Import the WarningStock component
import Anomaly from './components/Anomaly';

export default function App() {
  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthenticationImage />} />
          <Route path="/dashboard" element={<NavbarSegmented />}>
            <Route path="srrf" element={<SRRFForm />} />
            <Route path="input-assets" element={<InputAssetsForm />} />
            <Route path="available-assets" element={<AvailableAssetsForm />} />
            <Route path="defective-assets" element={<DefectiveAssetsForm onSelectAsset={() => { /* implementation here */ }} />} />
            <Route path="report" element={<Report />} />
            <Route path="warning-stock" element={<WarningStock />} /> {/* Ensure this route is defined */}
            <Route path="/dashboard/anomaly" element={<Anomaly />} /> {/* New route for Anomaly */}
          </Route>
        </Routes>
      </Router>
    </MantineProvider>
  );
}