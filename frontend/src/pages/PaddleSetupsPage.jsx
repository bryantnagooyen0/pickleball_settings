import React, { useEffect, useState } from 'react';
import {
  Box, Container, VStack, HStack, Text, Heading, Button,
  SimpleGrid, Spinner, Center, Select,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSetupStore } from '../store/setup';
import { usePaddleStore } from '../store/paddle';
import SetupCard from '../components/SetupCard';

const PaddleSetupsPage = () => {
  const { paddleId } = useParams();
  const navigate = useNavigate();
  const { setups, fetchSetups } = useSetupStore();
  const { paddles, fetchPaddles } = usePaddleStore();
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('likes');

  const paddle = paddles.find(p => p._id === paddleId);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchPaddles(), fetchSetups(paddleId, sort)]);
      setLoading(false);
    };
    load();
  }, [paddleId, sort]);

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="orange.400" />
      </Center>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <VStack spacing={6} align="stretch">

        {/* Back link */}
        <Button variant="ghost" color="gray.400" alignSelf="flex-start" onClick={() => navigate('/community')}>
          ← Back to Community
        </Button>

        {/* Header */}
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="xl" color="white">{paddle?.name || 'Paddle Setups'}</Heading>
            <Text color="gray.400">{paddle?.brand}</Text>
            <Text color="gray.500" fontSize="sm" mt={1}>{setups.length} community setup{setups.length !== 1 ? 's' : ''}</Text>
          </Box>
          <Button colorScheme="orange" onClick={() => navigate(`/community/new?paddleId=${paddleId}`)}>
            + Share a Setup for This Paddle
          </Button>
        </HStack>

        {/* Sort */}
        {setups.length > 1 && (
          <HStack>
            <Text color="gray.400" fontSize="sm">Sort by:</Text>
            <Select
              value={sort} onChange={(e) => setSort(e.target.value)}
              bg="gray.800" color="white" borderColor="gray.600" size="sm" maxW="160px"
            >
              <option value="likes">Most Liked</option>
              <option value="newest">Newest</option>
            </Select>
          </HStack>
        )}

        {/* Setups Grid */}
        {setups.length === 0 ? (
          <Center py={16}>
            <VStack spacing={4}>
              <Text color="gray.500" fontSize="lg">No setups yet for this paddle</Text>
              <Button colorScheme="orange" onClick={() => navigate(`/community/new?paddleId=${paddleId}`)}>
                Be the first to share a setup
              </Button>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
            {setups.map(setup => (
              <SetupCard key={setup._id} setup={setup} />
            ))}
          </SimpleGrid>
        )}

      </VStack>
    </Container>
  );
};

export default PaddleSetupsPage;
