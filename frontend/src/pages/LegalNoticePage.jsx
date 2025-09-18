import React from 'react';
import { Container, VStack, Text, Heading, Box, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const LegalNoticePage = () => {
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
            Legal Notice
          </Heading>
          
          <Text fontSize="sm" color="gray.600">
            Last updated: {new Date().toLocaleDateString()}
          </Text>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Website Information
            </Heading>
            <Text mb={4}>
              This website is operated by Pickleball Settings. The information provided on this 
              website is for general informational purposes only.
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Disclaimer of Liability
            </Heading>
            <Text mb={4}>
              The information on this website is provided on an "as is" basis. To the fullest extent 
              permitted by law, we exclude all representations, warranties, and conditions relating 
              to this website and the use of this website.
            </Text>
            <Text mb={4}>
              We shall not be liable for any direct, indirect, incidental, special, or consequential 
              damages arising out of or in connection with the use of this website.
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Information Accuracy
            </Heading>
            <Text mb={4}>
              While we make every effort to maintain accurate and up-to-date information on our platform, 
              we cannot guarantee that all content remains current at all times. Information may become 
              outdated due to changes in circumstances, regulations, or other factors beyond our control.
            </Text>
            <Text mb={4}>
              We disclaim any responsibility for the accuracy, completeness, or timeliness of the 
              information provided and make no warranties regarding the reliability of such information.
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              User-Generated Content
            </Heading>
            <Text mb={4}>
              Users are responsible for the content they post on this platform. We do not endorse 
              or guarantee the accuracy of user-generated content. Users must ensure their content 
              does not violate any laws or infringe on third-party rights.
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Intellectual Property
            </Heading>
            <Text mb={4}>
              The content, organization, graphics, design, compilation, magnetic translation, 
              digital conversion, and other matters related to this website are protected under 
              applicable copyrights, trademarks, and other proprietary rights.
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Governing Law
            </Heading>
            <Text mb={4}>
              This legal notice is governed by and construed in accordance with applicable laws. 
              Any disputes arising from this website shall be subject to the jurisdiction of the 
              appropriate courts.
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Modifications
            </Heading>
            <Text mb={4}>
              We reserve the right to modify this legal notice at any time. Changes will be 
              effective immediately upon posting. Your continued use of the website constitutes 
              acceptance of any modifications.
            </Text>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Contact Information
            </Heading>
            <Text mb={4}>
              For questions regarding this legal notice, please contact us at:
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

export default LegalNoticePage;
