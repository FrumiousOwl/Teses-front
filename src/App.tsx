import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthenticationImage } from './components/AuthenticationImage';
import { FooterSimple } from './components/FooterSimple';
import { NavbarSegmented } from './components/NavbarSegmented';
import { SRRFForm } from './components/SRRFForm';
import InputAssetsForm from './components/InputAssetsForm';
import AvailableAssetsForm from './components/AvailableAssetsForm';
import DefectiveAssetsForm from './components/DefectiveAssetsForm'; // Import DefectiveAssetsForm
import Report from './components/Report';

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
            <Route path="defective-assets" element={<DefectiveAssetsForm />} /> {/* Add DefectiveAssetsForm route */}
            <Route path="report" element={<Report />} /> {/* Assuming Report component is imported and exists */}
          </Route>
        </Routes>
      </Router>
      <FooterSimple />
    </MantineProvider>
  );
}
