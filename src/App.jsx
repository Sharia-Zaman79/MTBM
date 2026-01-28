import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertProvider } from './lib/alert-store';
import { Toaster } from './components/ui/sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import EngineerDashboard from './pages/engineer/Dashboard';
import EngineerNavigation from './pages/engineer/Navigation';
import EngineerSensors from './pages/engineer/Sensors';
import LogBook from './pages/engineer/LogBook';
import EngineerCallTechnician from './pages/engineer/CallTechnician';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import AdminDashboard from './pages/admin/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Engineer Dashboard Routes */}
            <Route path="/engineer" element={<EngineerDashboard />} />
            <Route path="/engineer/navigation" element={<EngineerNavigation />} />
            <Route path="/engineer/sensors" element={<EngineerSensors />} />
            <Route path="/engineer/logbook" element={<LogBook />} />
            <Route path="/engineer/call-technician" element={<EngineerCallTechnician />} />
            {/* Technician Dashboard Route */}
            <Route path="/technician" element={<TechnicianDashboard />} />
            {/* Admin Dashboard Route */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
        <Toaster position="top-center" />
      </AlertProvider>
    </QueryClientProvider>
  );
}

export default App;