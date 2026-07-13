import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPortal from './pages/AuthPortal';
import PatientPortal from './pages/PatientPortal';
import DoctorPortal from './pages/DoctorPortal';
import SuperAdmin from './pages/SuperAdmin';
import SetPassword from './pages/SetPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/portal" element={<AuthPortal />} />
        <Route path="/patient" element={<PatientPortal />} />
        <Route path="/doctor" element={<DoctorPortal />} />
        <Route path="/admin" element={<SuperAdmin />} />
        <Route path="/admin/setup/:token" element={<SetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
