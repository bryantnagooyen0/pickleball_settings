import React from 'react';
import { Box, Container, Heading, Text, VStack, Divider } from '@chakra-ui/react';
import UserComments from '../components/UserComments';

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
      <VStack spacing={6} align="stretch">
        {/* Account Info */}
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

        {/* User Comments Section */}
        {token && (
          <Box
            w='full'
            bg='white'
            borderRadius='lg'
            boxShadow='lg'
            border='1px solid'
            borderColor='gray.200'
            overflow='hidden'
          >
            <Box p={8}>
              <UserComments />
            </Box>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default AccountPage;


