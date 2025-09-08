import { Box } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import CreatePage from './pages/CreatePage';
import EditPage from './pages/EditPage';
import HomePage from './pages/HomePage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import PaddleManagementPage from './pages/PaddleManagementPage';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AccountPage from './pages/AccountPage';

function App() {
  return (
    <>
      <Box minH={'100vh'} bg={'gray.100'}>
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/create' element={<CreatePage />} />
          <Route path='/edit/:playerId' element={<EditPage />} />
          <Route path='/player/:playerId' element={<PlayerDetailPage />} />
          <Route path='/paddles' element={<PaddleManagementPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/account' element={<AccountPage />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
