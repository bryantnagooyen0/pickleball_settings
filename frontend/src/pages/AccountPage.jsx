import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

function AccountPage() {
  let token;
  let username;
  try {
    token = localStorage.getItem('token');
    username = localStorage.getItem('username');
  } catch (_) {
    token = null;
    username = null;
  }

  return (
    <Container maxW={'720px'} py={10}>
      <Box bg={'white'} p={6} rounded={'md'} shadow={'md'}>
        <VStack align={'start'} spacing={4}>
          <Heading size={'md'}>My Account</Heading>
          {token ? (
            <Text>
              You are currently logged in as {username || 'Unknown user'}
            </Text>
          ) : (
            <Text>Not logged in.</Text>
          )}
        </VStack>
      </Box>
    </Container>
  );
}

export default AccountPage;


