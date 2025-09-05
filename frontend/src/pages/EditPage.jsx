import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
  useToast,
  VStack,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/player';
import PaddleSelector from '../components/PaddleSelector';

const EditPage = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedPaddle, setSelectedPaddle] = useState(null);
  const [player, setPlayer] = useState({
    name: '',
    paddle: '',
    paddleBrand: '',
    paddleModel: '',
    paddleShape: '',
    paddleThickness: '',
    paddleHandleLength: '',
    paddleLength: '',
    paddleWidth: '',
    paddleColor: '',
    paddleImage: '',
    paddleCore: '',
    paddleWeight: '',
    image: '',
    age: '',
    height: '',
    mlpTeam: '',
    currentLocation: '',
    about: '',
    shoeImage: '',
    shoeModel: '',
    overgrips: '',
    weight: '',
  });

  const { updatePlayer } = usePlayerStore();

  // Handle paddle selection
  const handlePaddleSelect = paddle => {
    setSelectedPaddle(paddle);
  };

  // Handle paddle data changes
  const handlePaddleDataChange = paddleData => {
    setPlayer(prev => ({ ...prev, ...paddleData }));
  };

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`/api/players/${playerId}`);
        if (response.ok) {
          const result = await response.json();
          setPlayer(result.data);

          // Set selected paddle if player has paddle data
          if (result.data.paddle) {
            setSelectedPaddle({
              name: result.data.paddle,
              brand: result.data.paddleBrand || '',
              model: result.data.paddleModel || '',
              shape: result.data.paddleShape || '',
              thickness: result.data.paddleThickness || '',
              handleLength: result.data.paddleHandleLength || '',
              length: result.data.paddleLength || '',
              width: result.data.paddleWidth || '',
              color: result.data.paddleColor || '',
              image: result.data.paddleImage || '',
              core: result.data.paddleCore || '',
              weight: result.data.paddleWeight || '',
            });
          }
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

  const handleUpdatePlayer = async () => {
    const { success, message } = await updatePlayer(playerId, player);
    if (!success) {
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        isClosable: true,
      });
    } else {
      toast({
        title: 'Success',
        description: message,
        status: 'success',
        isClosable: true,
      });
      navigate(`/player/${playerId}`);
    }
  };

  if (loading) {
    return (
      <Container maxW='container.sm' py={12}>
        <Center>
          <Spinner size='xl' />
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW={'container.sm'}>
      <VStack spacing={8}>
        <Heading as={'h1'} size={'2xl'} textAlign={'center'} mb={8}>
          Edit Player
        </Heading>

        <Box
          bg={'white'}
          p={8}
          borderRadius='lg'
          boxShadow='lg'
          maxW='600px'
          mx='auto'
        >
          <VStack spacing={4}>
            <Input
              placeholder='Player Name'
              name='name'
              value={player.name}
              onChange={e => setPlayer({ ...player, name: e.target.value })}
            />

            <Box w='full'>
              <Text fontSize='sm' fontWeight='medium' mb={2} color='gray.700'>
                Paddle
              </Text>
              <PaddleSelector
                selectedPaddle={selectedPaddle}
                onPaddleSelect={handlePaddleSelect}
                onPaddleDataChange={handlePaddleDataChange}
                showCreateButton={true}
              />
            </Box>
            <Input
              placeholder='Paddle Shape (optional)'
              name='paddleShape'
              value={player.paddleShape || ''}
              onChange={e =>
                setPlayer({ ...player, paddleShape: e.target.value })
              }
            />
            <Input
              placeholder='Paddle Thickness (optional)'
              name='paddleThickness'
              value={player.paddleThickness || ''}
              onChange={e =>
                setPlayer({ ...player, paddleThickness: e.target.value })
              }
            />
            <Input
              placeholder='Paddle Handle Length (optional)'
              name='paddleHandleLength'
              value={player.paddleHandleLength || ''}
              onChange={e =>
                setPlayer({
                  ...player,
                  paddleHandleLength: e.target.value,
                })
              }
            />
            <Input
              placeholder='Paddle Color (optional)'
              name='paddleColor'
              value={player.paddleColor || ''}
              onChange={e =>
                setPlayer({ ...player, paddleColor: e.target.value })
              }
            />
            <Input
              placeholder='Paddle Image URL (optional)'
              name='paddleImage'
              value={player.paddleImage || ''}
              onChange={e =>
                setPlayer({ ...player, paddleImage: e.target.value })
              }
            />
            <Input
              placeholder='Image URL'
              name='image'
              value={player.image}
              onChange={e => setPlayer({ ...player, image: e.target.value })}
            />
            <Input
              placeholder='Age (optional)'
              name='age'
              type='number'
              value={player.age || ''}
              onChange={e => setPlayer({ ...player, age: e.target.value })}
            />
            <Input
              placeholder='Height (optional)'
              name='height'
              value={player.height || ''}
              onChange={e => setPlayer({ ...player, height: e.target.value })}
            />
            <Input
              placeholder='MLP Team (optional)'
              name='mlpTeam'
              value={player.mlpTeam || ''}
              onChange={e => setPlayer({ ...player, mlpTeam: e.target.value })}
            />
            <Input
              placeholder='Current Location (optional)'
              name='currentLocation'
              value={player.currentLocation || ''}
              onChange={e =>
                setPlayer({ ...player, currentLocation: e.target.value })
              }
            />
            <Textarea
              placeholder='About (optional)'
              name='about'
              value={player.about || ''}
              onChange={e => setPlayer({ ...player, about: e.target.value })}
              rows={4}
            />
            <Input
              placeholder='Shoe Image URL (optional)'
              name='shoeImage'
              value={player.shoeImage || ''}
              onChange={e =>
                setPlayer({ ...player, shoeImage: e.target.value })
              }
            />
            <Input
              placeholder='Shoe Model (optional)'
              name='shoeModel'
              value={player.shoeModel || ''}
              onChange={e =>
                setPlayer({ ...player, shoeModel: e.target.value })
              }
            />
            <Input
              placeholder='Overgrips (optional)'
              name='overgrips'
              value={player.overgrips || ''}
              onChange={e =>
                setPlayer({ ...player, overgrips: e.target.value })
              }
            />
            <Input
              placeholder='Sponsor (optional)'
              name='sponsor'
              value={player.sponsor || ''}
              onChange={e => setPlayer({ ...player, sponsor: e.target.value })}
            />
            <Input
              placeholder='Weight (optional)'
              name='weight'
              value={player.weight || ''}
              onChange={e => setPlayer({ ...player, weight: e.target.value })}
            />

            <Button colorScheme='blue' onClick={handleUpdatePlayer} w='full'>
              Update Player
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default EditPage;
