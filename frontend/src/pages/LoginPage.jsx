import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
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
      login(data.token, data.username, rememberMe);
      toast({ title: 'Logged in', status: 'success', duration: 2000, isClosable: true });
      navigate('/');
    } catch (err) {
      toast({ title: err.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await api.post('/api/users/google', {
        credential: credentialResponse.credential,
      });
      login(data.token, data.username, true);
      toast({ title: 'Logged in with Google', status: 'success', duration: 2000, isClosable: true });
      navigate('/');
    } catch (err) {
      toast({ title: err.message || 'Google login failed', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleGoogleError = () => {
    toast({ title: 'Google sign-in was cancelled or failed', status: 'error', duration: 3000, isClosable: true });
  };

  return (
    <Container maxW={'420px'} py={10}>
      <Box bg={'white'} p={6} rounded={'md'} shadow={'md'}>
        <Stack spacing={5} as={'form'} onSubmit={handleSubmit}>
          <Heading size={'md'} textAlign={'center'}>
            Login
          </Heading>
          <Box display={'flex'} justifyContent={'center'}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              width={'368'}
            />
          </Box>
          <HStack>
            <Divider />
            <Text fontSize={'sm'} color={'gray.500'} whiteSpace={'nowrap'} px={2}>
              or
            </Text>
            <Divider />
          </HStack>
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


