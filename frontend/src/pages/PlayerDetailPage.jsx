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

const PlayerDetailPage = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`/api/players/${playerId}`);
        if (response.ok) {
          const result = await response.json();
          setPlayer(result.data);
        } else {
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
  }, [playerId, navigate, toast]);

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
            <Box display='flex' alignItems='center' gap={8}>
              <Image
                src={player.image}
                alt={player.name}
                borderRadius='full'
                width='120px'
                height='120px'
                objectFit='cover'
                border='4px solid white'
                boxShadow='lg'
              />
              <Box flex={1}>
                <Text fontSize='4xl' fontWeight='bold' mb={2}>
                  {player.name}
                </Text>
                <VStack align='start' spacing={2}>
                  {player.age && (
                    <Text fontSize='lg'>
                      <strong>Age:</strong> {player.age} years old
                    </Text>
                  )}
                  {player.height && (
                    <Text fontSize='lg'>
                      <strong>Height:</strong> {player.height}
                    </Text>
                  )}
                  {player.mlpTeam && (
                    <Text fontSize='lg'>
                      <strong>MLP Team:</strong> {player.mlpTeam}
                    </Text>
                  )}
                  {player.currentLocation && (
                    <Text fontSize='lg'>
                      <strong>Location:</strong> {player.currentLocation}
                    </Text>
                  )}
                </VStack>
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
                badgeColor='blue'
                specifications={[
                  { label: 'Shape', field: 'paddleShape' },
                  { label: 'Thickness', field: 'paddleThickness' },
                  { label: 'Handle Length', field: 'paddleHandleLength' },
                  { label: 'Color', field: 'paddleColor' },
                  { label: 'Weight', field: 'paddleWeight' },
                  { label: 'Core', field: 'paddleCore' },
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
                specifications={[
                  { label: 'Size', field: 'shoeSize' },
                  { label: 'Type', field: 'shoeType' },
                  { label: 'Color', field: 'shoeColor' },
                ]}
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
                    brandField: 'overgripBrand',
                    badgeColor: 'purple',
                  },
                  {
                    label: 'Weight',
                    field: 'weight',
                    brandField: 'weightType',
                    badgeColor: 'orange',
                  },
                ]}
              />

              <HStack spacing={4} w='full' pt={4}>
                <Button
                  colorScheme='blue'
                  onClick={() => navigate(`/edit/${playerId}`)}
                  flex={1}
                >
                  Edit Player
                </Button>
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
