import React, { useEffect, useState } from 'react';
import {
  Box, Container, VStack, HStack, Text, Heading, Button, Input,
  SimpleGrid, Spinner, Center, Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSetupStore } from '../store/setup';
import SetupCard from '../components/SetupCard';

const PaddleCard = ({ paddle, count }) => {
  const navigate = useNavigate();
  return (
    <Box
      bg="gray.800" borderRadius="lg" p={4} cursor="pointer"
      border="1px solid" borderColor="gray.700"
      _hover={{ borderColor: 'orange.400', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      onClick={() => navigate(`/community/paddle/${paddle._id}`)}
    >
      <Text color="white" fontWeight="bold" fontSize="sm" noOfLines={1}>{paddle.name}</Text>
      <Text color="gray.500" fontSize="xs">{paddle.brand}</Text>
      <Text color="orange.400" fontSize="xs" mt={2}>{count} setup{count !== 1 ? 's' : ''} →</Text>
    </Box>
  );
};

const CommunityPage = () => {
  const navigate = useNavigate();
  const { recentSetups, paddlesWithSetups, fetchRecentSetups, fetchPaddlesWithSetups } = useSetupStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchRecentSetups(), fetchPaddlesWithSetups()]);
      setLoading(false);
    };
    load();
  }, []);

  const filteredPaddles = paddlesWithSetups.filter(({ paddle }) =>
    paddle.name.toLowerCase().includes(search.toLowerCase()) ||
    paddle.brand.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="orange.400" />
      </Center>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <VStack spacing={8} align="stretch">

        {/* Header */}
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="xl" color="white">Community Setups</Heading>
            <Text color="gray.400" mt={1}>Find your paddle. See what others are running.</Text>
          </Box>
          <Button colorScheme="orange" onClick={() => navigate('/community/new')}>
            + Share Your Setup
          </Button>
        </HStack>

        {/* Search */}
        <Input
          placeholder="Search paddles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg="gray.800" color="white" borderColor="gray.600"
          _placeholder={{ color: 'gray.500' }}
          maxW="400px"
        />

        {/* Newest Setups Strip */}
        {recentSetups.length > 0 && (
          <Box>
            <Text color="gray.400" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" mb={3}>
              ⚡ Newest Setups
            </Text>
            <Box overflowX="auto" pb={2}>
              <HStack spacing={4} minW="max-content">
                {recentSetups.map(setup => (
                  <Box key={setup._id} minW="180px" maxW="200px">
                    <SetupCard setup={setup} compact />
                  </Box>
                ))}
              </HStack>
            </Box>
          </Box>
        )}

        {/* Divider */}
        <Box borderTop="1px solid" borderColor="gray.700" />

        {/* Paddle Cards Grid */}
        <Box>
          <Text color="gray.400" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" mb={3}>
            🏓 Browse by Paddle
          </Text>
          {filteredPaddles.length === 0 ? (
            <Center py={12}>
              <VStack spacing={3}>
                <Text color="gray.500" fontSize="lg">
                  {search ? 'No paddles found matching your search' : 'No setups yet — be the first!'}
                </Text>
                <Button colorScheme="orange" variant="outline" onClick={() => navigate('/community/new')}>
                  Share a Setup
                </Button>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
              {filteredPaddles.map(({ paddle, count }) => (
                <PaddleCard key={paddle._id} paddle={paddle} count={count} />
              ))}
            </SimpleGrid>
          )}
        </Box>

      </VStack>
    </Container>
  );
};

export default CommunityPage;
