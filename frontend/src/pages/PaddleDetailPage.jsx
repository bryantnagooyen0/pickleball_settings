import React, { useState, useEffect } from 'react';
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
  Divider,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePaddleStore } from '../store/paddle';
import { usePlayerStore } from '../store/player';
import PlayerCard from '../components/PlayerCard';
import CommentSection from '../components/CommentSection';

const PaddleDetailPage = () => {
  const { paddleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [paddle, setPaddle] = useState(null);
  const [playersUsingPaddle, setPlayersUsingPaddle] = useState([]);
  const { paddles, fetchPaddles } = usePaddleStore();
  const { players, fetchPlayers } = usePlayerStore();

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
  }, [paddleId]); // Only depend on paddleId

  if (loading) {
    return (
      <Container maxW='container.sm' py={12}>
        <Center>
          <Spinner size='xl' />
        </Center>
      </Container>
    );
  }

  if (!paddle) {
    return null;
  }

  return (
    <Container maxW='container.xl' py={8}>
      <VStack spacing={6}>
        <Button
          onClick={() => navigate('/paddles')}
          colorScheme='blue'
          variant='outline'
          alignSelf='flex-start'
        >
          ← Back to Paddles
        </Button>

        {/* Paddle Info Section */}
        <Box
          w='full'
          bg='white'
          borderRadius='lg'
          boxShadow='lg'
          overflow='hidden'
        >
          {/* Header with Image and Basic Info */}
          <Box p={8}>
            <Box display='flex' alignItems='flex-start' gap={8}>
              {paddle.image && (
                <Image
                  src={paddle.image}
                  alt={paddle.name}
                  borderRadius='lg'
                  width='300px'
                  height='300px'
                  objectFit='contain'
                  bg='white'
                  border='1px solid'
                  borderColor='gray.200'
                  flexShrink={0}
                />
              )}
              <Box flex={1}>
                <Text fontSize='4xl' fontWeight='bold' mb={4}>
                  {paddle.name}
                </Text>

                <HStack spacing={4} mb={6}>
                  {paddle.brand && (
                    <Badge colorScheme='red' variant='subtle' fontSize='lg' px={3} py={1}>
                      {paddle.brand}
                    </Badge>
                  )}
                  {paddle.model && (
                    <Text fontSize='xl' color='gray.600'>
                      {paddle.model}
                    </Text>
                  )}
                </HStack>

                {/* Paddle Specifications Grid */}
                <SimpleGrid columns={2} spacing={4} mb={6}>
                  {paddle.shape && (
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={1}>
                        Shape
                      </Text>
                      <Badge colorScheme='blue' variant='subtle' fontSize='md'>
                        {paddle.shape}
                      </Badge>
                    </Box>
                  )}
                  {paddle.thickness && (
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={1}>
                        Thickness
                      </Text>
                      <Badge colorScheme='green' variant='subtle' fontSize='md'>
                        {paddle.thickness}
                      </Badge>
                    </Box>
                  )}
                  {paddle.handleLength && (
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={1}>
                        Handle Length
                      </Text>
                      <Text fontSize='lg' fontWeight='semibold'>
                        {paddle.handleLength}
                      </Text>
                    </Box>
                  )}
                  {paddle.length && (
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={1}>
                        Paddle Length
                      </Text>
                      <Text fontSize='lg' fontWeight='semibold'>
                        {paddle.length}
                      </Text>
                    </Box>
                  )}
                  {paddle.width && (
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={1}>
                        Paddle Width
                      </Text>
                      <Text fontSize='lg' fontWeight='semibold'>
                        {paddle.width}
                      </Text>
                    </Box>
                  )}
                  {paddle.core && (
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={1}>
                        Core
                      </Text>
                      <Text fontSize='lg' fontWeight='semibold'>
                        {paddle.core}
                      </Text>
                    </Box>
                  )}
                  {paddle.weight && (
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={1}>
                        Weight
                      </Text>
                      <Badge colorScheme='purple' variant='subtle' fontSize='md'>
                        {paddle.weight}
                      </Badge>
                    </Box>
                  )}
                </SimpleGrid>

                <Divider my={4} />

                {/* Description Section */}
                {paddle.description && (
                  <Box>
                    <Text fontSize='lg' fontWeight='bold' mb={2}>
                      Description
                    </Text>
                    <Text fontSize='md' color='gray.700' lineHeight='1.6'>
                      {paddle.description}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Used By Section */}
        <Box
          w='full'
          bg='white'
          borderRadius='lg'
          boxShadow='lg'
          overflow='hidden'
        >
          <Box p={8}>
            <Text fontSize='2xl' fontWeight='bold' color='gray.800' mb={6}>
              Used By
            </Text>
            
            {playersUsingPaddle.length > 0 ? (
              <SimpleGrid
                columns={{
                  base: 1,
                  md: 2,
                  lg: 3,
                }}
                spacing={6}
                w='full'
              >
                {playersUsingPaddle.map(player => (
                  <PlayerCard
                    key={player._id}
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
                ))}
              </SimpleGrid>
            ) : (
              <Box textAlign='center' py={8}>
                <Text fontSize='lg' color='gray.500'>
                  No players are currently using this paddle
                </Text>
              </Box>
            )}

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
              <Box p={8}>
                <CommentSection targetType="paddle" targetId={paddleId} />
              </Box>
            </Box>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
};

export default PaddleDetailPage;
