import React from 'react';
import { Box, Container, VStack, HStack, Text, Link, Divider } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box bg="gray.50" borderTop="1px" borderColor="gray.200" mt="auto">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6}>
          {/* Footer Links */}
          <HStack spacing={8} wrap="wrap" justify="center">
            <Link as={RouterLink} to="/privacy-policy" color="blue.500" _hover={{ textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
            <Link as={RouterLink} to="/legal-notice" color="blue.500" _hover={{ textDecoration: 'underline' }}>
              Legal Notice
            </Link>
          </HStack>
          
          <Divider />
          
          {/* Copyright */}
          <Text fontSize="sm" color="gray.600" textAlign="center">
            © {new Date().getFullYear()} Pickleball Settings. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Footer;
