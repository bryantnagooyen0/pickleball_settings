import { Box, useColorModeValue } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import CreatePage from './pages/CreatePage';
import EditPage from './pages/EditPage';
import HomePage from './pages/HomePage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Box minH={'100vh'} bg={useColorModeValue('gray.100', 'gray.900')}>
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/create' element={<CreatePage />} />
          <Route path='/edit/:playerId' element={<EditPage />} />
          <Route path='/player/:playerId' element={<PlayerDetailPage />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
