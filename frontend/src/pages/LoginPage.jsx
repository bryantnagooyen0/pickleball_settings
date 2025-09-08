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
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      if (data.username) {
        localStorage.setItem('username', data.username);
      }
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


