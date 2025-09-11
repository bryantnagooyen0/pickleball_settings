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
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import EquipmentModule from '../components/EquipmentModule';
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

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const result = await api.get(`/api/players/${playerId}`);
        setPlayer(result.data);
          toast({
            title: 'Error',
            description: 'Player not found',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          navigate('/');
        }
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
    if (player && paddles.length > 0 && !player.paddleCore && player.paddle) {
      // If player has a paddle but missing core details, try to find the paddle template
      const paddleTemplate = paddles.find(p => p.name === player.paddle);
      if (paddleTemplate) {
        // Merge paddle template data with player data
        const enhancedPlayerData = {
          ...player,
          paddleCore: player.paddleCore || paddleTemplate.core || '',
          paddleWeight: player.paddleWeight || paddleTemplate.weight || '',
          paddleBrand: player.paddleBrand || paddleTemplate.brand || '',
          paddleModel: player.paddleModel || paddleTemplate.model || '',
          paddleShape: player.paddleShape || paddleTemplate.shape || '',
          paddleThickness:
            player.paddleThickness || paddleTemplate.thickness || '',
          paddleHandleLength:
            player.paddleHandleLength || paddleTemplate.handleLength || '',
          paddleLength: player.paddleLength || paddleTemplate.length || '',
          paddleWidth: player.paddleWidth || paddleTemplate.width || '',
          paddleColor: player.paddleColor || paddleTemplate.color || '',
          paddleImage: player.paddleImage || paddleTemplate.image || '',
        };
        setPlayer(enhancedPlayerData);
      }
    }
  }, [paddles.length, player?.paddle, player?.paddleCore]);

  if (loading) {
    return (
      <Container maxW='container.xl' py={12}>
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
    <Container maxW='container.xl' py={8}>
      <VStack spacing={6}>
        <Button
          onClick={() => navigate('/')}
          colorScheme='blue'
          variant='outline'
          alignSelf='flex-start'
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
            p={8}
            bg='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            color='white'
          >
            <Box display='flex' alignItems='flex-start' gap={8}>
              <Image
                src={player.image}
                alt={player.name}
                borderRadius='full'
                width='120px'
                height='120px'
                objectFit='cover'
                border='4px solid white'
                boxShadow='lg'
                flexShrink={0}
              />
              <Box flex={1}>
                <Text fontSize='4xl' fontWeight='bold' mb={4}>
                  {player.name}
                </Text>

                {/* Player Info Grid */}
                <SimpleGrid columns={2} spacing={4} mb={4}>
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
            </Box>
          </Box>

          {/* Equipment Section */}
          <Box p={8}>
            <VStack spacing={6} align='start'>
              <Text fontSize='2xl' fontWeight='bold' color='gray.800' mb={4}>
                Equipment
              </Text>

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

              <HStack spacing={4} w='full' pt={4}>
                {getRoleFromToken() === 'admin' && (
                  <Button
                    colorScheme='blue'
                    onClick={() => navigate(`/edit/${playerId}`)}
                    flex={1}
                  >
                    Edit Player
                  </Button>
                )}
                <Button
                  colorScheme='red'
                  variant='outline'
                  onClick={() => navigate('/')}
                  flex={1}
                >
                  Back to List
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
};

export default PlayerDetailPage;
