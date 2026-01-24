import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  VStack,
  Text,
  Box,
  Image,
  Badge,
  Button,
  HStack,
  useToast,
  Spinner,
  Center,
  SimpleGrid,
  Stack,
  Heading,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import EquipmentModule from '../components/EquipmentModule';
import CommentSection from '../components/CommentSection';
import { usePaddleStore } from '../store/paddle';
import { api } from '../utils/api';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);

// Helper function to decode JWT and get role
const getRoleFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
};

const PlayerDetailPage = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { paddles, fetchPaddles } = usePaddleStore();
  const headerRef = useRef(null);
  const infoRef = useRef(null);
  const equipmentRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0 });
  const infoInView = useInView(infoRef, { once: true, amount: 0 });
  const equipmentInView = useInView(equipmentRef, { once: true, amount: 0 });

  // Always scroll to top when component mounts or playerId changes
  // Don't clear scroll restoration flags - let Players page handle that after restoring
  useEffect(() => {
    // Scroll to top immediately and after a brief delay to ensure it sticks
    window.scrollTo(0, 0);
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [playerId]);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const result = await api.get(`/api/players/${playerId}`);
        setPlayer(result.data);
      } catch (error) {
        console.error('Error fetching player:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch player details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
    fetchPaddles();
  }, [playerId, navigate, toast, fetchPaddles]);

  // Set dynamic meta tags for social media previews
  useEffect(() => {
    if (player) {
      const baseUrl = 'https://pickleball-settings.vercel.app';
      const playerUrl = `${baseUrl}/player/${playerId}`;
      const playerImage = player.image || `${baseUrl}/logo_preview_card.png`;
      
      // Update document title
      document.title = `${player.name} | Pickleball Profile`;
      
      // Update or create meta tags
      const updateMetaTag = (property, content) => {
        let meta = document.querySelector(`meta[property="${property}"]`) || 
                   document.querySelector(`meta[name="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          if (property.startsWith('og:')) {
            meta.setAttribute('property', property);
          } else {
            meta.setAttribute('name', property);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // Open Graph meta tags
      updateMetaTag('og:title', `${player.name} | Pickleball Profile`);
      updateMetaTag('og:description', `View detailed stats and equipment for ${player.name}.`);
      updateMetaTag('og:image', playerImage);
      updateMetaTag('og:image:width', '1608');
      updateMetaTag('og:image:height', '630');
      updateMetaTag('og:type', 'website');
      updateMetaTag('og:url', playerUrl);
      
      // Twitter Card meta tags
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', `${player.name} | Pickleball Profile`);
      updateMetaTag('twitter:description', `View detailed stats and equipment for ${player.name}.`);
      updateMetaTag('twitter:image', playerImage);
    }
  }, [player, playerId]);

  // Enhance player data with paddle template information when paddles are loaded
  useEffect(() => {
    if (player && paddles.length > 0 && player.paddle && !player.paddlePriceLink) {
      const paddleTemplate = paddles.find(p => p.name === player.paddle);
      
      if (paddleTemplate && paddleTemplate.priceLink) {
        const enhancedPlayerData = {
          ...player,
          paddleCore: player.paddleCore || paddleTemplate.core || '',
          paddleWeight: player.paddleWeight || paddleTemplate.weight || '',
          paddleBrand: player.paddleBrand || paddleTemplate.brand || '',
          paddleModel: player.paddleModel || paddleTemplate.model || '',
          paddleShape: player.paddleShape || paddleTemplate.shape || '',
          paddleThickness: player.paddleThickness || paddleTemplate.thickness || '',
          paddleHandleLength: player.paddleHandleLength || paddleTemplate.handleLength || '',
          paddleLength: player.paddleLength || paddleTemplate.length || '',
          paddleWidth: player.paddleWidth || paddleTemplate.width || '',
          paddleColor: player.paddleColor || paddleTemplate.color || '',
          paddleImage: player.paddleImage || paddleTemplate.image || '',
          paddlePriceLink: paddleTemplate.priceLink,
        };
        setPlayer(enhancedPlayerData);
      }
    }
  }, [paddles.length, player?.paddle, player?.paddlePriceLink]);

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

  if (!player) {
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
              onClick={() => navigate('/players')}
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
              ← Back to Players
            </Button>
          </MotionBox>

          {/* Player Header */}
          <MotionVStack
            ref={headerRef}
            spacing={6}
            w="full"
            align="center"
            initial={{ opacity: 1, y: 0 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Box
              position="relative"
              w={{ base: '200px', md: '280px' }}
              h={{ base: '200px', md: '280px' }}
              borderRadius="full"
              overflow="hidden"
              border="4px solid white"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
            >
              <Image
                src={player.image}
                alt={player.name}
                w="full"
                h="full"
                objectFit="cover"
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
                      {player.name.charAt(0)}
                    </Text>
                  </Box>
                }
              />
            </Box>

            <MotionHeading
              as="h1"
              fontSize={{ base: '3rem', md: '4.5rem', lg: '5.5rem' }}
              fontFamily="var(--font-display)"
              fontWeight={700}
              letterSpacing="-0.02em"
              textAlign="center"
              color="var(--color-text-primary)"
            >
              {player.name}
            </MotionHeading>
          </MotionVStack>

          {/* Player Info Section */}
          <MotionBox
            ref={infoRef}
            w="full"
            maxW="900px"
            bg="white"
            borderRadius={0}
            p={{ base: 6, md: 8 }}
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
            initial={{ opacity: 0, y: 20 }}
            animate={infoInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <VStack spacing={6} align="stretch">
              {/* Player Details Grid */}
              {(player.age || player.height || player.mlpTeam || player.currentLocation || player.sponsor) && (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
                  {player.age && (
                    <Box>
                      <Text
                        fontSize="sm"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={500}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Age
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight={600}
                        color="var(--color-text-primary)"
                        fontFamily="var(--font-body)"
                      >
                        {player.age} years old
                      </Text>
                    </Box>
                  )}
                  {player.height && (
                    <Box>
                      <Text
                        fontSize="sm"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={500}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Height
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight={600}
                        color="var(--color-text-primary)"
                        fontFamily="var(--font-body)"
                      >
                        {player.height}
                      </Text>
                    </Box>
                  )}
                  {player.mlpTeam && (
                    <Box>
                      <Text
                        fontSize="sm"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={500}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        MLP Team
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight={600}
                        color="var(--color-text-primary)"
                        fontFamily="var(--font-body)"
                      >
                        {player.mlpTeam}
                      </Text>
                    </Box>
                  )}
                  {player.currentLocation && (
                    <Box>
                      <Text
                        fontSize="sm"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={500}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Location
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight={600}
                        color="var(--color-text-primary)"
                        fontFamily="var(--font-body)"
                      >
                        {player.currentLocation}
                      </Text>
                    </Box>
                  )}
                  {player.sponsor && (
                    <Box>
                      <Text
                        fontSize="sm"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={500}
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Sponsor
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
                        {player.sponsor}
                      </Badge>
                    </Box>
                  )}
                </SimpleGrid>
              )}

              {/* About Section */}
              {player.about && (
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
                    About
                  </Text>
                  <Text
                    fontSize="md"
                    lineHeight="1.8"
                    color="var(--color-text-primary)"
                    fontFamily="var(--font-body)"
                    fontWeight={400}
                  >
                    {player.about}
                  </Text>
                </Box>
              )}
            </VStack>
          </MotionBox>

          {/* Equipment Section */}
          <MotionBox
            ref={equipmentRef}
            w="full"
            maxW="900px"
            initial={{ opacity: 1, y: 0 }}
            animate={equipmentInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <VStack spacing={4} align="stretch">
              <MotionHeading
                as="h2"
                fontSize={{ base: '2rem', md: '2.5rem' }}
                fontFamily="var(--font-display)"
                fontWeight={700}
                color="var(--color-text-primary)"
                textAlign="center"
              >
                Equipment
              </MotionHeading>

              <MotionText
                fontSize="sm"
                color="var(--color-text-secondary)"
                fontFamily="var(--font-body)"
                fontStyle="italic"
                textAlign="center"
                mb={4}
              >
                It is possible for gear to be outdated, please feel free to comment down below with any updates
              </MotionText>

              {/* Equipment Modules */}
              <Box
                bg="white"
                borderRadius={0}
                p={{ base: 6, md: 8 }}
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
              >
                <VStack spacing={4} align="stretch">
                  {/* Paddle Module */}
                  <EquipmentModule
                    player={player}
                    title='Paddle'
                    icon='paddle'
                    imageField='paddleImage'
                    nameField='paddle'
                    brandField='paddleBrand'
                    modelField='paddleModel'
                    badgeColor='blue'
                    specifications={[
                      { label: 'Shape', field: 'paddleShape' },
                      { label: 'Paddle Length', field: 'paddleLength' },
                      { label: 'Thickness', field: 'paddleThickness' },
                      { label: 'Paddle Width', field: 'paddleWidth' },
                      { label: 'Core', field: 'paddleCore' },
                      { label: 'Handle Length', field: 'paddleHandleLength' },
                    ]}
                  />

                  {/* Shoes Module */}
                  <EquipmentModule
                    player={player}
                    title='Shoes'
                    icon='shoes'
                    imageField='shoeImage'
                    nameField='shoeModel'
                    brandField='shoeBrand'
                    badgeColor='green'
                  />

                  {/* Modifications Module */}
                  <EquipmentModule
                    player={player}
                    title='Modifications'
                    icon='modifications'
                    hideProductDisplay={true}
                    modifications={[
                      {
                        label: 'Overgrips',
                        field: 'overgrips',
                        imageField: 'overgripImage',
                        brandField: 'overgripBrand',
                        badgeColor: 'purple',
                      },
                      {
                        label: 'Weight',
                        field: 'weight',
                        imageField: 'weightImage',
                        brandField: 'weightType',
                        badgeColor: 'orange',
                      },
                      {
                        label: 'Additional modification',
                        field: 'additionalModification',
                        imageField: 'additionalModificationImage',
                        brandField: 'additionalModificationBrand',
                        badgeColor: 'green',
                      },
                    ]}
                  />
                </VStack>
              </Box>

              {/* Action Buttons */}
              <HStack spacing={4} justify="center" flexWrap="wrap">
                {getRoleFromToken() === 'admin' && (
                  <Button
                    onClick={() => navigate(`/edit/${playerId}`)}
                    size="lg"
                    px={6}
                    bg="var(--color-primary)"
                    color="white"
                    border="none"
                    borderRadius="full"
                    fontFamily="var(--font-body)"
                    fontWeight={600}
                    fontSize="md"
                    _hover={{
                      bg: "var(--color-accent)",
                    }}
                    transition="all 0.3s ease"
                    as={motion.button}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Edit Player
                  </Button>
                )}
                <Button
                  onClick={() => navigate('/players')}
                  size="lg"
                  px={6}
                  variant="outline"
                  border="1px solid"
                  borderColor="rgba(0, 0, 0, 0.1)"
                  borderRadius="full"
                  color="var(--color-text-primary)"
                  fontFamily="var(--font-body)"
                  fontWeight={600}
                  fontSize="md"
                  bg="white"
                  _hover={{
                    bg: "var(--color-bg)",
                    borderColor: "var(--color-accent)",
                    color: "var(--color-accent)",
                  }}
                  transition="all 0.3s ease"
                  as={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to List
                </Button>
              </HStack>

              {/* Comments Section */}
              <Box
                w="full"
                bg="white"
                borderRadius={0}
                p={{ base: 6, md: 8 }}
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                mt={4}
              >
                <CommentSection targetType="player" targetId={playerId} />
              </Box>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default PlayerDetailPage;
