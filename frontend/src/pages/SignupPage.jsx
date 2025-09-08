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

function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Signup failed');
      }

      toast({ title: 'Account created', status: 'success', duration: 2000, isClosable: true });
      navigate('/login');
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
            Sign Up
          </Heading>
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


