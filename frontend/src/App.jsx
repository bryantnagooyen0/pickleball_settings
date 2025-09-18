import { Box, Spinner, Center } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect } from 'react';
import CreatePage from './pages/CreatePage';
import EditPage from './pages/EditPage';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import PaddleManagementPage from './pages/PaddleManagementPage';
import PaddleDetailPage from './pages/PaddleDetailPage';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AccountPage from './pages/AccountPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LegalNoticePage from './pages/LegalNoticePage';
import Footer from './components/Footer';
import { useAuth } from './hooks/useAuth';
import { keepAlive } from './utils/api';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  // Keep backend alive - ping every 10 minutes
  useEffect(() => {
    // Initial ping
    keepAlive();
    
    // Set up interval for keep-alive pings
    const interval = setInterval(keepAlive, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Box minH={'100vh'} bg={'gray.100'}>
        <Navbar />
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/players' element={<HomePage />} />
          <Route path='/create' element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
          <Route path='/edit/:playerId' element={<ProtectedRoute><EditPage /></ProtectedRoute>} />
          <Route path='/player/:playerId' element={<PlayerDetailPage />} />
          <Route path='/paddles' element={<PaddleManagementPage />} />
          <Route path='/paddle/:paddleId' element={<PaddleDetailPage />} />
          <Route path='/login' element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path='/signup' element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path='/account' element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
          <Route path='/legal-notice' element={<LegalNoticePage />} />
        </Routes>
        <Footer />
      </Box>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
