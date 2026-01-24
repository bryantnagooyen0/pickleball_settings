import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  VStack,
  Text,
  Box,
  Button,
  Image,
  SimpleGrid,
  Badge,
  HStack,
  Spinner,
  Center,
  useToast,
  Heading,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { usePaddleStore } from '../store/paddle';
import { usePlayerStore } from '../store/player';
import PlayerCard from '../components/PlayerCard';
import CommentSection from '../components/CommentSection';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);

const PaddleDetailPage = () => {
  const { paddleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [paddle, setPaddle] = useState(null);
  const [playersUsingPaddle, setPlayersUsingPaddle] = useState([]);
  const { paddles, fetchPaddles } = usePaddleStore();
  const { players, fetchPlayers } = usePlayerStore();
  const headerRef = useRef(null);
  const infoRef = useRef(null);
  const playersRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0 });
  const infoInView = useInView(infoRef, { once: true, amount: 0 });
  const playersInView = useInView(playersRef, { once: true, amount: 0 });

  useEffect(() => {
    const loadPaddle = async () => {
      try {
        await Promise.all([fetchPaddles(true), fetchPlayers()]); // Force refresh paddles
        
        // Get fresh data from store after fetching
        const { paddles: currentPaddles } = usePaddleStore.getState();
        const { players: currentPlayerStore } = usePlayerStore.getState();
        
        const foundPaddle = currentPaddles.find(p => p._id === paddleId);
        if (foundPaddle) {
          setPaddle(foundPaddle);
          // Find players using this paddle (matching name, shape, and thickness)
          const usingPaddle = currentPlayerStore.filter(player => {
            // First check if paddle name matches
            const nameMatches = player.paddle === foundPaddle.name || 
              (player.paddleBrand && player.paddleModel && 
               `${player.paddleBrand} ${player.paddleModel}`.toLowerCase() === foundPaddle.name.toLowerCase());
            
            if (!nameMatches) return false;
            
            // Then check if shape matches (if both have shape specified)
            const shapeMatches = !foundPaddle.shape || !player.paddleShape || 
              player.paddleShape.toLowerCase() === foundPaddle.shape.toLowerCase();
            
            // Then check if thickness matches (if both have thickness specified)
            const thicknessMatches = !foundPaddle.thickness || !player.paddleThickness || 
              player.paddleThickness.toLowerCase() === foundPaddle.thickness.toLowerCase();
            
            return shapeMatches && thicknessMatches;
          });
          setPlayersUsingPaddle(usingPaddle);
        } else {
          toast({
            title: 'Error',
            description: 'Paddle not found',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          navigate('/paddles');
        }
      } catch (error) {
        console.error('Error loading paddle:', error);
        toast({
          title: 'Error',
          description: 'Failed to load paddle details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/paddles');
      } finally {
        setLoading(false);
      }
    };

    loadPaddle();
  }, [paddleId, navigate, toast, fetchPaddles, fetchPlayers]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="var(--color-bg)"
        sx={{
          background: 'radial-gradient(circle at 20% 50%, rgba(44, 95, 124, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.03) 0%, transparent 50%), var(--color-bg)',
        }}
      >
        <Container maxW='container.xl' py={12}>
          <Center>
            <Spinner size='xl' color="var(--color-primary)" />
          </Center>
        </Container>
      </Box>
    );
  }

  if (!paddle) {
    return null;
  }

  return (
    <Box
      minH="100vh"
      bg="var(--color-bg)"
      sx={{
        background: 'radial-gradient(circle at 20% 50%, rgba(44, 95, 124, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.03) 0%, transparent 50%), var(--color-bg)',
        '--font-display': '"Merriweather", serif',
        '--font-body': '"Inter", sans-serif',
        '--color-primary': '#2C5F7C',
        '--color-secondary': '#6B8E9F',
        '--color-accent': '#FF6B6B',
        '--color-bg': '#FAF9F6',
        '--color-text-primary': '#1A1A1A',
        '--color-text-secondary': '#666666',
      }}
    >
      <Container maxW='container.xl' py={{ base: 12, md: 16 }} position="relative" zIndex={1}>
        <VStack spacing={{ base: 6, md: 8 }}>
          {/* Back Button */}
          <MotionBox
            alignSelf="flex-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button
              onClick={() => navigate('/paddles')}
              variant="ghost"
              color="var(--color-text-primary)"
              fontFamily="var(--font-body)"
              fontWeight={600}
              fontSize={{ base: 'sm', md: 'md' }}
              _hover={{
                bg: "var(--color-bg)",
                color: "var(--color-accent)",
              }}
              transition="all 0.3s ease"
            >
              ← Back to Paddles
            </Button>
          </MotionBox>

          {/* Paddle Header */}
          <MotionVStack
            ref={headerRef}
            spacing={6}
            w="full"
            align="center"
            initial={{ opacity: 1, y: 0 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {paddle.image && (
              <Box
                position="relative"
                w={{ base: '200px', md: '280px' }}
                h={{ base: '200px', md: '280px' }}
                borderRadius={0}
                overflow="hidden"
                bg="white"
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={4}
              >
                <Image
                  src={paddle.image}
                  alt={paddle.name}
                  w="full"
                  h="full"
                  objectFit="contain"
                  loading="lazy"
                  fallback={
                    <Box
                      w="full"
                      h="full"
                      bg="var(--color-bg)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="6xl" color="var(--color-text-secondary)" fontFamily="var(--font-display)">
                        {paddle.name.charAt(0)}
                      </Text>
                    </Box>
                  }
                />
              </Box>
            )}

            <MotionHeading
              as="h1"
              fontSize={{ base: '3rem', md: '4.5rem', lg: '5.5rem' }}
              fontFamily="var(--font-display)"
              fontWeight={700}
              letterSpacing="-0.02em"
              textAlign="center"
              color="var(--color-text-primary)"
            >
              {paddle.name}
            </MotionHeading>

            {/* Brand and Model Badges */}
            {(paddle.brand || paddle.model) && (
              <HStack spacing={3} flexWrap="wrap" justify="center">
                {paddle.brand && (
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="var(--color-primary)"
                    color="white"
                    fontSize="md"
                    fontFamily="var(--font-body)"
                    fontWeight={600}
                  >
                    {paddle.brand}
                  </Badge>
                )}
                {paddle.model && (
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    border="1px solid"
                    borderColor="var(--color-primary)"
                    bg="transparent"
                    color="var(--color-primary)"
                    fontSize="md"
                    fontFamily="var(--font-body)"
                    fontWeight={600}
                  >
                    {paddle.model}
                  </Badge>
                )}
              </HStack>
            )}
          </MotionVStack>

          {/* Paddle Info Section */}
          <MotionBox
            ref={infoRef}
            w="full"
            maxW="900px"
            bg="white"
            borderRadius={0}
            p={{ base: 6, md: 8 }}
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
            initial={{ opacity: 1, y: 0 }}
            animate={infoInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <VStack spacing={6} align="stretch">
              {/* Paddle Specifications Grid */}
              {(paddle.shape || paddle.thickness || paddle.handleLength || paddle.length || paddle.width || paddle.core || paddle.weight) && (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
                  {paddle.shape && (
                    <Box>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Shape
                      </Text>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="var(--color-primary)"
                        color="white"
                        fontSize="md"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                      >
                        {paddle.shape}
                      </Badge>
                    </Box>
                  )}
                  {paddle.thickness && (
                    <Box>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Thickness
                      </Text>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="var(--color-accent)"
                        color="white"
                        fontSize="md"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                      >
                        {paddle.thickness}
                      </Badge>
                    </Box>
                  )}
                  {paddle.handleLength && (
                    <Box>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Handle Length
                      </Text>
                      <Text
                        fontSize="md"
                        fontWeight={600}
                        fontFamily="var(--font-body)"
                        color="var(--color-text-primary)"
                      >
                        {paddle.handleLength}
                      </Text>
                    </Box>
                  )}
                  {paddle.length && (
                    <Box>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Paddle Length
                      </Text>
                      <Text
                        fontSize="md"
                        fontWeight={600}
                        fontFamily="var(--font-body)"
                        color="var(--color-text-primary)"
                      >
                        {paddle.length}
                      </Text>
                    </Box>
                  )}
                  {paddle.width && (
                    <Box>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Paddle Width
                      </Text>
                      <Text
                        fontSize="md"
                        fontWeight={600}
                        fontFamily="var(--font-body)"
                        color="var(--color-text-primary)"
                      >
                        {paddle.width}
                      </Text>
                    </Box>
                  )}
                  {paddle.core && (
                    <Box>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Core
                      </Text>
                      <Text
                        fontSize="md"
                        fontWeight={600}
                        fontFamily="var(--font-body)"
                        color="var(--color-text-primary)"
                      >
                        {paddle.core}
                      </Text>
                    </Box>
                  )}
                  {paddle.weight && (
                    <Box>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Weight
                      </Text>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="var(--color-secondary)"
                        color="white"
                        fontSize="md"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                      >
                        {paddle.weight}
                      </Badge>
                    </Box>
                  )}
                </SimpleGrid>
              )}

              {/* Description Section */}
              {paddle.description && (
                <Box pt={4} borderTop="1px solid" borderColor="rgba(0, 0, 0, 0.1)">
                  <Text
                    fontSize="sm"
                    color="var(--color-text-secondary)"
                    fontFamily="var(--font-body)"
                    fontWeight={600}
                    mb={3}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    Description
                  </Text>
                  <Text
                    fontSize="md"
                    lineHeight="1.8"
                    color="var(--color-text-primary)"
                    fontFamily="var(--font-body)"
                    fontWeight={400}
                  >
                    {paddle.description}
                  </Text>
                </Box>
              )}
            </VStack>
          </MotionBox>

          {/* Used By Section */}
          <MotionBox
            ref={playersRef}
            w="full"
            maxW="900px"
            initial={{ opacity: 1, y: 0 }}
            animate={playersInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <VStack spacing={6} align="stretch">
              <MotionHeading
                as="h2"
                fontSize={{ base: '2rem', md: '2.5rem' }}
                fontFamily="var(--font-display)"
                fontWeight={700}
                color="var(--color-text-primary)"
                textAlign="center"
              >
                Used By
              </MotionHeading>

              {playersUsingPaddle.length > 0 ? (
                <Box
                  bg="white"
                  borderRadius={0}
                  p={{ base: 6, md: 8 }}
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                >
                  <SimpleGrid
                    columns={{
                      base: 1,
                      sm: 2,
                      md: 2,
                      lg: 3,
                    }}
                    spacing={{ base: 4, md: 6 }}
                    w="full"
                  >
                    {playersUsingPaddle.map((player, index) => (
                      <MotionBox
                        key={player._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <PlayerCard
                          player={player}
                          onPlayerDeleted={() => {
                            // Refresh the players list when a player is deleted
                            fetchPlayers().then(() => {
                              const usingPaddle = players.filter(p => {
                                // First check if paddle name matches
                                const nameMatches = p.paddle === paddle.name || 
                                  (p.paddleBrand && p.paddleModel && 
                                   `${p.paddleBrand} ${p.paddleModel}`.toLowerCase() === paddle.name.toLowerCase());
                                
                                if (!nameMatches) return false;
                                
                                // Then check if shape matches (if both have shape specified)
                                const shapeMatches = !paddle.shape || !p.paddleShape || 
                                  p.paddleShape.toLowerCase() === paddle.shape.toLowerCase();
                                
                                // Then check if thickness matches (if both have thickness specified)
                                const thicknessMatches = !paddle.thickness || !p.paddleThickness || 
                                  p.paddleThickness.toLowerCase() === paddle.thickness.toLowerCase();
                                
                                return shapeMatches && thicknessMatches;
                              });
                              setPlayersUsingPaddle(usingPaddle);
                            });
                          }}
                        />
                      </MotionBox>
                    ))}
                  </SimpleGrid>
                </Box>
              ) : (
                <Box
                  bg="white"
                  borderRadius={0}
                  p={{ base: 6, md: 8 }}
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                  textAlign="center"
                >
                  <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    color="var(--color-text-secondary)"
                    fontFamily="var(--font-body)"
                  >
                    No players are currently using this paddle
                  </Text>
                </Box>
              )}

              {/* Comments Section */}
              <Box
                w="full"
                bg="white"
                borderRadius={0}
                p={{ base: 6, md: 8 }}
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                mt={4}
              >
                <CommentSection targetType="paddle" targetId={paddleId} />
              </Box>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default PaddleDetailPage;
