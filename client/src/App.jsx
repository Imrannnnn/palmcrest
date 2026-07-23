import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPortal from './pages/AuthPortal';
import PatientPortal from './pages/PatientPortal';
import DoctorPortal from './pages/DoctorPortal';
import SuperAdmin from './pages/SuperAdmin';
import SetPassword from './pages/SetPassword';
import EmergencyPage from './pages/EmergencyPage';
import SpecialistPage from './pages/SpecialistPage';
import ReviewPage from './pages/ReviewPage';
import AboutPage from './pages/AboutPage';

function GlobalLoader({ children }) {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Route change handler - show a brief loading state for page transitions
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Patch window.fetch to track API calls and show loading spinner during async requests
  useEffect(() => {
    const originalFetch = window.fetch;
    let activeRequests = 0;
    let timerId = null;

    window.fetch = async (...args) => {
      activeRequests++;
      setLoading(true);
      if (timerId) clearTimeout(timerId);

      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        activeRequests--;
        if (activeRequests === 0) {
          timerId = setTimeout(() => {
            setLoading(false);
          }, 350);
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  // Click interceptor for standard buttons & action elements
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const target = e.target.closest('button, a, [role="button"]');
      if (!target) return;

      const className = target.className || '';
      const id = target.id || '';
      const text = target.innerText || '';
      const ariaExpanded = target.getAttribute('aria-expanded');

      // Exclude toggles, menu closes, tab selectors, password eyes, and minor UI updates
      if (
        ariaExpanded === 'true' || 
        ariaExpanded === 'false' ||
        className.includes('toggle') || 
        className.includes('close') || 
        className.includes('tab') ||
        className.includes('eye') ||
        id.includes('toggle') || 
        id.includes('close') ||
        id.includes('menu') ||
        text.toLowerCase().includes('close') ||
        text.toLowerCase().includes('menu')
      ) {
        return;
      }

      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <>
      {children}
      {loading && (
        <>
          {/* Top Line Loading Bar */}
          <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#004B50] via-[#00C3DA] to-[#004B50] z-[99999] animate-pulse"></div>
          {/* Frosted Glass Spinner Overlay */}
          <div className="fixed inset-0 bg-white/45 backdrop-blur-[2px] z-[99998] flex items-center justify-center animate-fade-in">
            <div className="glass-card p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl border border-white/60 max-w-[200px] text-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-1">
                <p className="text-primary font-bold text-sm tracking-wide">Processing</p>
                <p className="text-[10px] text-on-surface-variant animate-pulse font-medium">Please wait...</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <GlobalLoader>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/portal" element={<AuthPortal />} />
          <Route path="/patient" element={<PatientPortal />} />
          <Route path="/doctor" element={<DoctorPortal />} />
          <Route path="/admin" element={<SuperAdmin />} />
          <Route path="/admin/setup/:token" element={<SetPassword />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/specialists" element={<SpecialistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/review/:appointmentId" element={<ReviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GlobalLoader>
    </Router>
  );
}

export default App;

