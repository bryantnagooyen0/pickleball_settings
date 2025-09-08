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
  FormControl,
  FormLabel,
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
    overgripImage: '',
    weight: '',
    weightImage: '',
    totalWeight: '',
    weightLocation: '',
    tapeDetails: '',
    additionalModification: '',
    additionalModificationImage: '',
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
            <FormControl>
              <FormLabel>Player Name</FormLabel>
              <Input
                placeholder='Enter player name'
                name='name'
                value={player.name}
                onChange={e => setPlayer({ ...player, name: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Paddle</FormLabel>
              <PaddleSelector
                selectedPaddle={selectedPaddle}
                onPaddleSelect={handlePaddleSelect}
                onPaddleDataChange={handlePaddleDataChange}
                showCreateButton={true}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Paddle Shape</FormLabel>
              <Input
                placeholder='Enter paddle shape (optional)'
                name='paddleShape'
                value={player.paddleShape || ''}
                onChange={e =>
                  setPlayer({ ...player, paddleShape: e.target.value })
                }
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Paddle Thickness</FormLabel>
              <Input
                placeholder='Enter paddle thickness (optional)'
                name='paddleThickness'
                value={player.paddleThickness || ''}
                onChange={e =>
                  setPlayer({ ...player, paddleThickness: e.target.value })
                }
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Paddle Handle Length</FormLabel>
              <Input
                placeholder='Enter handle length (optional)'
                name='paddleHandleLength'
                value={player.paddleHandleLength || ''}
                onChange={e =>
                  setPlayer({
                    ...player,
                    paddleHandleLength: e.target.value,
                  })
                }
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Paddle Image URL</FormLabel>
              <Input
                placeholder='Enter paddle image URL (optional)'
                name='paddleImage'
                value={player.paddleImage || ''}
                onChange={e =>
                  setPlayer({ ...player, paddleImage: e.target.value })
                }
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Player Image URL</FormLabel>
              <Input
                placeholder='Enter player image URL'
                name='image'
                value={player.image}
                onChange={e => setPlayer({ ...player, image: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Age</FormLabel>
              <Input
                placeholder='Enter age (optional)'
                name='age'
                type='number'
                value={player.age || ''}
                onChange={e => setPlayer({ ...player, age: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Height</FormLabel>
              <Input
                placeholder='Enter height (optional)'
                name='height'
                value={player.height || ''}
                onChange={e => setPlayer({ ...player, height: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>MLP Team</FormLabel>
              <Input
                placeholder='Enter MLP team (optional)'
                name='mlpTeam'
                value={player.mlpTeam || ''}
                onChange={e => setPlayer({ ...player, mlpTeam: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Current Location</FormLabel>
              <Input
                placeholder='Enter current location (optional)'
                name='currentLocation'
                value={player.currentLocation || ''}
                onChange={e =>
                  setPlayer({ ...player, currentLocation: e.target.value })
                }
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>About</FormLabel>
              <Textarea
                placeholder='Enter player description (optional)'
                name='about'
                value={player.about || ''}
                onChange={e => setPlayer({ ...player, about: e.target.value })}
                rows={4}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Shoe Image URL</FormLabel>
              <Input
                placeholder='Enter shoe image URL (optional)'
                name='shoeImage'
                value={player.shoeImage || ''}
                onChange={e =>
                  setPlayer({ ...player, shoeImage: e.target.value })
                }
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Shoe Model</FormLabel>
              <Input
                placeholder='Enter shoe model (optional)'
                name='shoeModel'
                value={player.shoeModel || ''}
                onChange={e =>
                  setPlayer({ ...player, shoeModel: e.target.value })
                }
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Overgrips</FormLabel>
              <Input
                placeholder='Enter overgrips (optional)'
                name='overgrips'
                value={player.overgrips || ''}
                onChange={e =>
                  setPlayer({ ...player, overgrips: e.target.value })
                }
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Overgrip Image URL</FormLabel>
              <Input
                placeholder='Enter overgrip image URL (optional)'
                name='overgripImage'
                value={player.overgripImage || ''}
                onChange={e =>
                  setPlayer({ ...player, overgripImage: e.target.value })
                }
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Sponsor</FormLabel>
              <Input
                placeholder='Enter sponsor (optional)'
                name='sponsor'
                value={player.sponsor || ''}
                onChange={e => setPlayer({ ...player, sponsor: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Weight Image URL</FormLabel>
              <Input
                placeholder='Enter weight image URL (optional)'
                name='weightImage'
                value={player.weightImage || ''}
                onChange={e => setPlayer({ ...player, weightImage: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Total Weight</FormLabel>
              <Input
                placeholder='Enter total weight (optional)'
                name='totalWeight'
                value={player.totalWeight || ''}
                onChange={e => setPlayer({ ...player, totalWeight: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Weight Location</FormLabel>
              <Input
                placeholder='Enter weight location (optional)'
                name='weightLocation'
                value={player.weightLocation || ''}
                onChange={e => setPlayer({ ...player, weightLocation: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Tape Details</FormLabel>
              <Input
                placeholder='Enter tape details (optional)'
                name='tapeDetails'
                value={player.tapeDetails || ''}
                onChange={e => setPlayer({ ...player, tapeDetails: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Additional Modification</FormLabel>
              <Input
                placeholder='Enter additional modification (optional)'
                name='additionalModification'
                value={player.additionalModification || ''}
                onChange={e => setPlayer({ ...player, additionalModification: e.target.value })}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Additional Modification Image URL</FormLabel>
              <Input
                placeholder='Enter additional modification image URL (optional)'
                name='additionalModificationImage'
                value={player.additionalModificationImage || ''}
                onChange={e => setPlayer({ ...player, additionalModificationImage: e.target.value })}
              />
            </FormControl>

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
