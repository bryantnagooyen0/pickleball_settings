import React from 'react';
import { Container, VStack, Text, Heading, Box, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxW="container.lg" py={12}>
      <VStack spacing={8} align="start">
        <Button
          onClick={() => navigate(-1)}
          colorScheme="blue"
          variant="outline"
          alignSelf="flex-start"
        >
          ← Back
        </Button>

        <VStack spacing={6} align="start" w="full">
          <Heading size="xl" color="gray.800">
            Privacy Policy
          </Heading>
          
          <Text fontSize="sm" color="gray.600">
            Last updated: {new Date().toLocaleDateString()}
          </Text>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Information We Collect
            </Heading>
            <Text mb={4}>
              We collect information you provide directly to us, such as when you create an account, 
              add player or paddle information, or post comments. This may include:
            </Text>
            <Text as="ul" pl={6} mb={4}>
              <Text as="li" mb={2}>Name, email address, and account credentials</Text>
              <Text as="li" mb={2}>Player profiles and equipment information</Text>
              <Text as="li" mb={2}>Comments and interactions on the platform</Text>
              <Text as="li" mb={2}>Usage data and analytics information</Text>
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              How We Use Your Information
            </Heading>
            <Text mb={4}>
              We use the information we collect to:
            </Text>
            <Text as="ul" pl={6} mb={4}>
              <Text as="li" mb={2}>Provide and maintain our services</Text>
              <Text as="li" mb={2}>Process transactions and send related information</Text>
              <Text as="li" mb={2}>Send technical notices and support messages</Text>
              <Text as="li" mb={2}>Respond to your comments and questions</Text>
              <Text as="li" mb={2}>Improve our services and develop new features</Text>
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Information Sharing
            </Heading>
            <Text mb={4}>
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy. We may share your information:
            </Text>
            <Text as="ul" pl={6} mb={4}>
              <Text as="li" mb={2}>With your explicit consent</Text>
              <Text as="li" mb={2}>To comply with legal obligations</Text>
              <Text as="li" mb={2}>To protect our rights and prevent fraud</Text>
              <Text as="li" mb={2}>With service providers who assist in our operations</Text>
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Data Security
            </Heading>
            <Text mb={4}>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the internet is 100% secure.
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Your Rights
            </Heading>
            <Text mb={4}>
              You have the right to:
            </Text>
            <Text as="ul" pl={6} mb={4}>
              <Text as="li" mb={2}>Access and update your personal information</Text>
              <Text as="li" mb={2}>Delete your account and associated data</Text>
              <Text as="li" mb={2}>Opt out of certain communications</Text>
              <Text as="li" mb={2}>Request a copy of your data</Text>
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Contact Us
            </Heading>
            <Text mb={4}>
              If you have any questions about this Privacy Policy, please contact us at:
            </Text>
            <Text fontWeight="medium" color="blue.600">
              napkinbusiness123@gmail.com
            </Text>
          </Box>
        </VStack>
      </VStack>
    </Container>
  );
};

export default PrivacyPolicyPage;
