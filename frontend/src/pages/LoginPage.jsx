import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/api/users/login', { username, password, rememberMe });

      // Use the auth hook to handle login
      login(data.token, data.username, rememberMe);
      toast({ title: 'Logged in', status: 'success', duration: 2000, isClosable: true });
      navigate('/');
    } catch (err) {
      toast({ title: err.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW={'420px'} py={10}>
      <Box bg={'white'} p={6} rounded={'md'} shadow={'md'}>
        <Stack spacing={5} as={'form'} onSubmit={handleSubmit}>
          <Heading size={'md'} textAlign={'center'}>
            Login
          </Heading>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <FormControl>
            <Checkbox 
              isChecked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              colorScheme='blue'
            >
              Remember me
            </Checkbox>
          </FormControl>
          <Button type='submit' colorScheme='blue' isLoading={loading}>
            Login
          </Button>
          <Button as={Link} to={'/signup'} variant={'link'} colorScheme='blue'>
            Need an account? Sign up
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

export default LoginPage;


