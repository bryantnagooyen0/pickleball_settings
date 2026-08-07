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
      <Box
        minH="100vh"
        sx={{
          background: 'radial-gradient(circle at 20% 50%, rgba(44,95,124,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212,165,116,0.03) 0%, transparent 50%), var(--color-bg)',
          '--color-bg': '#FAF9F6',
        }}
      >
        <Center minH="60vh">
          <Spinner size="xl" color="#2C5F7C" />
        </Center>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      sx={{
        background: 'radial-gradient(circle at 20% 50%, rgba(44,95,124,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212,165,116,0.03) 0%, transparent 50%), var(--color-bg)',
        '--color-primary': '#2C5F7C',
        '--color-secondary': '#D4A574',
        '--color-accent': '#8B9DC3',
        '--color-bg': '#FAF9F6',
        '--color-text-primary': '#1A1A1A',
        '--color-text-secondary': '#666666',
        '--font-display': '"Merriweather", serif',
        '--font-body': '"Inter", sans-serif',
      }}
    >
      <Container maxW="1200px" py={{ base: 8, md: 12 }}>
        <VStack spacing={6} align="stretch">

          {/* Back link */}
          <Button
            variant="ghost"
            color="var(--color-primary)"
            alignSelf="flex-start"
            fontFamily="var(--font-body)"
            fontWeight={600}
            _hover={{ bg: 'rgba(44,95,124,0.06)' }}
            onClick={() => navigate('/community')}
          >
            ← Back to Community
          </Button>

          {/* Header */}
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Box>
              <Heading
                size="xl"
                fontFamily="var(--font-display)"
                color="var(--color-text-primary)"
                letterSpacing="-0.02em"
              >
                {paddle?.name || 'Paddle Setups'}
              </Heading>
              <Text color="var(--color-text-secondary)" fontFamily="var(--font-body)">
                {paddle?.brand}
              </Text>
              <Text color="var(--color-text-secondary)" fontSize="sm" mt={1}
                fontFamily="var(--font-body)">
                {setups.length} community setup{setups.length !== 1 ? 's' : ''}
              </Text>
              <Box w="48px" h="3px" bg="var(--color-secondary)" mt={2} />
            </Box>
            <Button
              bg="var(--color-primary)"
              color="white"
              borderRadius="full"
              fontFamily="var(--font-body)"
              fontWeight={600}
              _hover={{ bg: '#1e4a61', transform: 'translateY(-2px)' }}
              transition="all 0.2s ease"
              onClick={() => navigate(`/community/new?paddleId=${paddleId}`)}
            >
              + Share a Setup for This Paddle
            </Button>
          </HStack>

          {/* Sort */}
          {setups.length > 1 && (
            <HStack>
              <Text color="var(--color-text-secondary)" fontSize="sm"
                fontFamily="var(--font-body)">Sort by:</Text>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                bg="white"
                color="var(--color-text-primary)"
                borderColor="gray.300"
                size="sm"
                maxW="160px"
                fontFamily="var(--font-body)"
                _focus={{ borderColor: 'var(--color-primary)' }}
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
                <Text color="var(--color-text-secondary)" fontSize="lg"
                  fontFamily="var(--font-body)">
                  No setups yet for this paddle
                </Text>
                <Button
                  bg="var(--color-primary)"
                  color="white"
                  borderRadius="full"
                  fontFamily="var(--font-body)"
                  fontWeight={600}
                  _hover={{ bg: '#1e4a61' }}
                  onClick={() => navigate(`/community/new?paddleId=${paddleId}`)}
                >
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
    </Box>
  );
};

export default PaddleSetupsPage;
