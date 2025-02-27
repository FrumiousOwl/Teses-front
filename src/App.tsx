import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthenticationImage } from './components/AuthenticationImage';
import { NavbarSegmented } from './components/NavbarSegmented';
import SRRFForm from './components/SRRFForm'; 
import InputAssetsForm from './components/InputAssetsForm';
import AvailableAssetsForm from './components/AvailableAssetsForm';
import DefectiveAssetsForm from './components/DefectiveAssetsForm';
import Report from './components/Report'; // Import the Report component

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
            <Route path="defective-assets" element={<DefectiveAssetsForm onSelectAsset={function (asset: { hardwareId: number; name: string; datePurchased: string; defective: number; supplier: string; }): void {
              throw new Error('Function not implemented.');
            } } />} />
            <Route path="report" element={<Report />} /> {/* Add the Report route */}
          </Route>
        </Routes>
      </Router>
    </MantineProvider>
  );
}