import React, { useState, useEffect } from 'react';
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
  Icon,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import EquipmentModule from '../components/EquipmentModule';
import CommentSection from '../components/CommentSection';
import { usePaddleStore } from '../store/paddle';
import { api } from '../utils/api';

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

  // Responsive values for mobile optimization - MUST be called before any early returns
  const containerMaxW = useBreakpointValue({ base: 'container.sm', md: 'container.lg', lg: 'container.xl' });
  const padding = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const titleFontSize = useBreakpointValue({ base: '2xl', md: '3xl', lg: '4xl' });
  const sectionFontSize = useBreakpointValue({ base: 'xl', md: '2xl' });
  const imageSize = useBreakpointValue({ base: '80px', md: '100px', lg: '120px' });
  const gridColumns = useBreakpointValue({ base: 1, sm: 2 });
  const verticalSpacing = useBreakpointValue({ base: 4, md: 6 });

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
      <Container maxW={containerMaxW} py={12}>
        <Center>
          <Spinner size='xl' />
        </Center>
      </Container>
    );
  }

  if (!player) {
    return null;
  }

  return (
    <Container maxW={containerMaxW} py={4}>
      <VStack spacing={verticalSpacing}>
        <Button
          onClick={() => navigate('/players')}
          colorScheme='blue'
          variant='outline'
          alignSelf='flex-start'
          size={{ base: 'sm', md: 'md' }}
        >
          ← Back to Players
        </Button>

        {/* Player Info Section - Top */}
        <Box
          w='full'
          bg='white'
          borderRadius='lg'
          boxShadow='lg'
          overflow='hidden'
        >
          {/* Header with Image and Basic Info */}
          <Box
            p={padding}
            bg='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            color='white'
          >
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <Stack 
              direction={{ base: 'column', lg: 'row' }} 
              spacing={{ base: 4, lg: 8 }}
              align={{ base: 'center', lg: 'flex-start' }}
            >
              <Image
                src={player.image}
                alt={player.name}
                borderRadius='full'
                width={imageSize}
                height={imageSize}
                objectFit='cover'
                border='4px solid white'
                boxShadow='lg'
                flexShrink={0}
              />
              <Box flex={1} w={{ base: 'full', lg: 'auto' }}>
                <Text fontSize={titleFontSize} fontWeight='bold' mb={4} textAlign={{ base: 'center', lg: 'left' }}>
                  {player.name}
                </Text>

                {/* Player Info Grid */}
                <SimpleGrid columns={gridColumns} spacing={4} mb={4}>
                  {player.age && (
                    <Box>
                      <Text fontSize='sm' color='white' opacity={0.8} mb={1}>
                        Age
                      </Text>
                      <Text fontSize='lg' fontWeight='semibold'>
                        {player.age} years old
                      </Text>
                    </Box>
                  )}
                  {player.height && (
                    <Box>
                      <Text fontSize='sm' color='white' opacity={0.8} mb={1}>
                        Height
                      </Text>
                      <Text fontSize='lg' fontWeight='semibold'>
                        {player.height}
                      </Text>
                    </Box>
                  )}
                  {player.mlpTeam && (
                    <Box>
                      <Text fontSize='sm' color='white' opacity={0.8} mb={1}>
                        MLP Team
                      </Text>
                      <Text fontSize='lg' fontWeight='semibold'>
                        {player.mlpTeam}
                      </Text>
                    </Box>
                  )}
                  {player.currentLocation && (
                    <Box>
                      <Text fontSize='sm' color='white' opacity={0.8} mb={1}>
                        Location
                      </Text>
                      <Text fontSize='lg' fontWeight='semibold'>
                        {player.currentLocation}
                      </Text>
                    </Box>
                  )}
                  {player.sponsor && (
                    <Box>
                      <Text fontSize='sm' color='white' opacity={0.8} mb={1}>
                        Sponsor
                      </Text>
                      <Text fontSize='lg' fontWeight='semibold'>
                        {player.sponsor}
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>

                {/* About Section */}
                {player.about && (
                  <Box mt={4}>
                    <Text fontSize='sm' color='white' opacity={0.8} mb={2}>
                      About
                    </Text>
                    <Text fontSize='md' lineHeight='1.6'>
                      {player.about}
                    </Text>
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>

          {/* Equipment Section */}
          <Box p={padding}>
            <VStack spacing={verticalSpacing} align='start'>
              <Stack 
                direction={{ base: 'column', md: 'row' }}
                justify="space-between" 
                align={{ base: 'start', md: 'center' }} 
                w="full" 
                mb={4}
                spacing={{ base: 2, md: 4 }}
              >
                <Text fontSize={sectionFontSize} fontWeight='bold' color='gray.800'>
                  Equipment
                </Text>
                <Text fontSize='sm' color='gray.600' fontStyle='italic' textAlign={{ base: 'left', md: 'right' }}>
                  It is possible for gear to be outdated, please feel free to comment down below with any updates!
                </Text>
              </Stack>

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

              <Stack 
                direction={{ base: 'column', sm: 'row' }}
                spacing={4} 
                w='full' 
                pt={4}
              >
                {getRoleFromToken() === 'admin' && (
                  <Button
                    colorScheme='blue'
                    onClick={() => navigate(`/edit/${playerId}`)}
                    flex={1}
                    size={{ base: 'sm', md: 'md' }}
                  >
                    Edit Player
                  </Button>
                )}
                <Button
                  colorScheme='red'
                  variant='outline'
                  onClick={() => navigate('/players')}
                  flex={1}
                  size={{ base: 'sm', md: 'md' }}
                >
                  Back to List
                </Button>
              </Stack>

              {/* Comments Section */}
              <Box
                w='full'
                bg='white'
                borderRadius='lg'
                boxShadow='lg'
                border='1px solid'
                borderColor='gray.200'
                overflow='hidden'
                mt={6}
              >
                <Box p={padding}>
                  <CommentSection targetType="player" targetId={playerId} />
                </Box>
              </Box>
            </VStack>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
};

export default PlayerDetailPage;
