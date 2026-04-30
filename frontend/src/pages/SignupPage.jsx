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
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/users/signup', { username, password });
      toast({ title: 'Account created', status: 'success', duration: 2000, isClosable: true });
      navigate('/login');
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
      toast({ title: 'Account created with Google', status: 'success', duration: 2000, isClosable: true });
      navigate('/');
    } catch (err) {
      toast({ title: err.message || 'Google sign-up failed', status: 'error', duration: 3000, isClosable: true });
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
            Sign Up
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
          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>
          <Button type='submit' colorScheme='blue' isLoading={loading}>
            Create account
          </Button>
          <Button as={Link} to={'/login'} variant={'link'} colorScheme='blue'>
            Already have an account? Log in
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

export default SignupPage;


