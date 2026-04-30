import React, { useEffect, useState } from 'react';
import {
  Box, Container, VStack, HStack, Text, Heading, Button, Input,
  SimpleGrid, Spinner, Center, InputGroup, InputLeftElement, Image,
} from '@chakra-ui/react';
import { SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useSetupStore } from '../store/setup';
import { usePaddleStore } from '../store/paddle';
import SetupCard from '../components/SetupCard';

const BRAND = {
  bg: '#FAF9F6',
  primary: '#2C5F7C',
  secondary: '#D4A574',
  accent: '#8B9DC3',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  fontDisplay: '"Playfair Display", "Merriweather", serif',
  fontBody: '"Inter", sans-serif',
};

const PaddleCard = ({ paddle, count }) => {
  const navigate = useNavigate();
  return (
    <Box
      bg="white"
      borderRadius="0"
      cursor="pointer"
      border="1px solid"
      borderColor="rgba(0,0,0,0.08)"
      boxShadow="0 2px 12px rgba(0,0,0,0.04)"
      position="relative"
      overflow="hidden"
      _hover={{
        borderColor: BRAND.primary,
        boxShadow: '0 6px 24px rgba(44,95,124,0.1)',
        transform: 'translateY(-3px)',
      }}
      transition="all 0.3s cubic-bezier(0.16,1,0.3,1)"
      onClick={() => navigate(`/community/paddle/${paddle._id}`)}
    >
      {/* Image area */}
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="rgba(0,0,0,0.06)"
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {paddle.image ? (
          <Image
            src={paddle.image}
            alt={paddle.name}
            maxH="172px"
            maxW="90%"
            objectFit="contain"
          />
        ) : (
          <Box
            w="88px"
            h="88px"
            borderRadius="50%"
            bg={`${BRAND.accent}22`}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="4xl">🏓</Text>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box p={6} position="relative">
        <Box
          position="absolute"
          top={0}
          left={0}
          w="3px"
          h="100%"
          bg={BRAND.primary}
        />
        <Text
          color={BRAND.textPrimary}
          fontWeight={600}
          fontSize="lg"
          fontFamily={BRAND.fontBody}
          noOfLines={1}
          mb={1}
        >
          {paddle.name}
        </Text>
        <Text color={BRAND.textSecondary} fontSize="md" fontFamily={BRAND.fontBody}>
          {paddle.brand}
        </Text>
        <Text color={BRAND.primary} fontSize="md" mt={3} fontWeight={500} letterSpacing="0.03em">
          {count} setup{count !== 1 ? 's' : ''} →
        </Text>
      </Box>
    </Box>
  );
};

const CommunityPage = () => {
  const navigate = useNavigate();
  const { recentSetups, paddlesWithSetups, fetchRecentSetups, fetchPaddlesWithSetups } = useSetupStore();
  const { paddles, fetchPaddles } = usePaddleStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchRecentSetups(), fetchPaddlesWithSetups(), fetchPaddles()]);
      setLoading(false);
    };
    load();
  }, []);

  // Build a count map from paddlesWithSetups, then apply to all paddles
  const setupCountMap = paddlesWithSetups.reduce((acc, { paddle, count }) => {
    acc[paddle._id] = count;
    return acc;
  }, {});

  const allPaddlesWithCount = paddles
    .filter(p => p.isActive !== false)
    .map(p => ({ paddle: p, count: setupCountMap[p._id] || 0 }));

  const filteredPaddles = allPaddlesWithCount.filter(({ paddle }) =>
    paddle.name.toLowerCase().includes(search.toLowerCase()) ||
    paddle.brand.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box bg={BRAND.bg} minH="100vh">
        <Center minH="60vh">
          <Spinner size="xl" color={BRAND.primary} thickness="3px" />
        </Center>
      </Box>
    );
  }

  return (
    <Box
      bg={BRAND.bg}
      minH="100vh"
      sx={{
        '--font-display': BRAND.fontDisplay,
        '--font-body': BRAND.fontBody,
        '--color-primary': BRAND.primary,
        '--color-secondary': BRAND.secondary,
        '--color-accent': BRAND.accent,
        '--color-bg': BRAND.bg,
        '--color-text-primary': BRAND.textPrimary,
        '--color-text-secondary': BRAND.textSecondary,
      }}
    >
      <Container maxW="1200px" py={12}>
        <VStack spacing={12} align="stretch">

          {/* Header */}
          <HStack justify="space-between" flexWrap="wrap" gap={4} pb={6} borderBottom="1px solid" borderColor="rgba(0,0,0,0.08)">
            <Box>
              <Heading
                fontFamily={BRAND.fontDisplay}
                fontWeight={700}
                fontSize={{ base: '2.5rem', md: '3.5rem' }}
                letterSpacing="-0.02em"
                lineHeight="1.1"
                color={BRAND.textPrimary}
              >
                Community Setups
              </Heading>
              <Box w="60px" h="2px" bg={BRAND.secondary} mt={3} mb={3} />
              <Text
                color={BRAND.textSecondary}
                fontFamily={BRAND.fontBody}
                fontSize="md"
                fontWeight={400}
                lineHeight="1.7"
              >
                Find your paddle. See what others are running.
              </Text>
            </Box>
            <Button
              size="lg"
              h="48px"
              px={8}
              bg={BRAND.primary}
              color="white"
              borderRadius="0"
              fontFamily={BRAND.fontBody}
              fontWeight={500}
              fontSize="sm"
              letterSpacing="0.06em"
              textTransform="uppercase"
              rightIcon={<ArrowForwardIcon />}
              _hover={{ bg: BRAND.accent }}
              transition="all 0.3s cubic-bezier(0.16,1,0.3,1)"
              onClick={() => navigate('/community/new')}
            >
              Share Your Setup
            </Button>
          </HStack>

          {/* Newest Setups Strip */}
          {recentSetups.length > 0 && (
            <Box>
              <Text
                color={BRAND.textSecondary}
                fontSize="xs"
                fontWeight={600}
                fontFamily={BRAND.fontBody}
                textTransform="uppercase"
                letterSpacing="0.12em"
                mb={4}
              >
                Newest Setups
              </Text>
              <Box overflowX="auto" pb={3}>
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
          <Box borderTop="1px solid" borderColor="rgba(0,0,0,0.08)" />

          {/* Paddle Cards Grid */}
          <Box>
            <Text
              color={BRAND.textSecondary}
              fontSize="md"
              fontWeight={600}
              fontFamily={BRAND.fontBody}
              textTransform="uppercase"
              letterSpacing="0.12em"
              mb={5}
            >
              Browse by Paddle
            </Text>

            {/* Search */}
            <InputGroup maxW="480px" mb={6}>
              <InputLeftElement pointerEvents="none" h="100%">
                <SearchIcon color={BRAND.textSecondary} />
              </InputLeftElement>
              <Input
                placeholder="Search paddles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="white"
                color={BRAND.textPrimary}
                border="1px solid"
                borderColor="rgba(0,0,0,0.12)"
                borderRadius="0"
                fontFamily={BRAND.fontBody}
                fontSize="sm"
                h="44px"
                _placeholder={{ color: BRAND.textSecondary, opacity: 0.6 }}
                _focus={{
                  borderColor: BRAND.primary,
                  boxShadow: `0 0 0 3px rgba(44,95,124,0.1)`,
                  outline: 'none',
                }}
                _hover={{ borderColor: BRAND.accent }}
                transition="all 0.3s ease"
              />
            </InputGroup>
            {filteredPaddles.length === 0 ? (
              <Center py={16}>
                <VStack spacing={4}>
                  <Text color={BRAND.textSecondary} fontSize="lg" fontFamily={BRAND.fontBody}>
                    {search ? 'No paddles found matching your search' : 'No paddles in the database yet.'}
                  </Text>
                  <Button
                    variant="outline"
                    border="1px solid"
                    borderColor={BRAND.primary}
                    borderRadius="0"
                    color={BRAND.primary}
                    fontFamily={BRAND.fontBody}
                    fontWeight={500}
                    fontSize="sm"
                    letterSpacing="0.06em"
                    textTransform="uppercase"
                    _hover={{ bg: BRAND.primary, color: 'white' }}
                    transition="all 0.3s cubic-bezier(0.16,1,0.3,1)"
                    onClick={() => navigate('/community/new')}
                  >
                    Share a Setup
                  </Button>
                </VStack>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                {filteredPaddles.map(({ paddle, count }) => (
                  <PaddleCard key={paddle._id} paddle={paddle} count={count} />
                ))}
              </SimpleGrid>
            )}
          </Box>

        </VStack>
      </Container>
    </Box>
  );
};

export default CommunityPage;
