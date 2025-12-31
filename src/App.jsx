import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertProvider } from './lib/alert-store';
import { Toaster } from './components/ui/sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EngineerDashboard from './pages/engineer/Dashboard';
import EngineerNavigation from './pages/engineer/Navigation';
import EngineerSensors from './pages/engineer/Sensors';

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
            {/* Engineer Dashboard Routes */}
            <Route path="/engineer" element={<EngineerDashboard />} />
            <Route path="/engineer/navigation" element={<EngineerNavigation />} />
            <Route path="/engineer/sensors" element={<EngineerSensors />} />
          </Routes>
        </Router>
        <Toaster position="top-center" />
      </AlertProvider>
    </QueryClientProvider>
  );
}

export default App;