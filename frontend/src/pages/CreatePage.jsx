import React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
  useToast,
  VStack,
  Text,
} from '@chakra-ui/react';
import { usePlayerStore } from '../store/player';
import PaddleSelector from '../components/PaddleSelector';

const CreatePage = () => {
  const [selectedPaddle, setSelectedPaddle] = useState(null);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    paddle: '',
    paddleBrand: '',
    paddleModel: '',
    paddleShape: '',
    paddleThickness: '',
    paddleHandleLength: '',
    paddleLength: '',
    paddleWidth: '',
    paddleImage: '',
    paddleCore: '',
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

  const toast = useToast();

  const { createPlayer } = usePlayerStore();

  // Handle paddle selection
  const handlePaddleSelect = paddle => {
    setSelectedPaddle(paddle);
  };

  // Handle paddle data changes
  const handlePaddleDataChange = paddleData => {
    setNewPlayer(prev => ({ ...prev, ...paddleData }));
  };

  const handleAddPlayer = async () => {
    const { success, message } = await createPlayer(newPlayer);
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
    }
    setNewPlayer({
      name: '',
      paddle: '',
      paddleBrand: '',
      paddleModel: '',
      paddleShape: '',
      paddleThickness: '',
      paddleHandleLength: '',
      paddleLength: '',
      paddleWidth: '',
      paddleImage: '',
      paddleCore: '',
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
      sponsor: '',
    });
    setSelectedPaddle(null);
  };

  return (
    <Container maxW={'container.sm'}>
      <VStack spacing={8}>
        <Heading as={'h1'} size={'2xl'} textAlign={'center'} mb={8}>
          Create New Player
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
              value={newPlayer.name}
              onChange={e =>
                setNewPlayer({ ...newPlayer, name: e.target.value })
              }
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
              placeholder='Image URL'
              name='image'
              value={newPlayer.image}
              onChange={e =>
                setNewPlayer({ ...newPlayer, image: e.target.value })
              }
            />
            <Input
              placeholder='Age (optional)'
              name='age'
              type='number'
              value={newPlayer.age}
              onChange={e =>
                setNewPlayer({ ...newPlayer, age: e.target.value })
              }
            />
            <Input
              placeholder='Height (optional)'
              name='height'
              value={newPlayer.height}
              onChange={e =>
                setNewPlayer({ ...newPlayer, height: e.target.value })
              }
            />
            <Input
              placeholder='MLP Team (optional)'
              name='mlpTeam'
              value={newPlayer.mlpTeam}
              onChange={e =>
                setNewPlayer({ ...newPlayer, mlpTeam: e.target.value })
              }
            />
            <Input
              placeholder='Current Location (optional)'
              name='currentLocation'
              value={newPlayer.currentLocation}
              onChange={e =>
                setNewPlayer({ ...newPlayer, currentLocation: e.target.value })
              }
            />
            <Textarea
              placeholder='About (optional)'
              name='about'
              value={newPlayer.about}
              onChange={e =>
                setNewPlayer({ ...newPlayer, about: e.target.value })
              }
              rows={4}
            />
            <Input
              placeholder='Shoe Image URL (optional)'
              name='shoeImage'
              value={newPlayer.shoeImage}
              onChange={e =>
                setNewPlayer({ ...newPlayer, shoeImage: e.target.value })
              }
            />
            <Input
              placeholder='Shoe Model (optional)'
              name='shoeModel'
              value={newPlayer.shoeModel}
              onChange={e =>
                setNewPlayer({ ...newPlayer, shoeModel: e.target.value })
              }
            />
            <Input
              placeholder='Overgrips (optional)'
              name='overgrips'
              value={newPlayer.overgrips}
              onChange={e =>
                setNewPlayer({ ...newPlayer, overgrips: e.target.value })
              }
            />
            <Input
              placeholder='Overgrip Image URL (optional)'
              name='overgripImage'
              value={newPlayer.overgripImage}
              onChange={e =>
                setNewPlayer({ ...newPlayer, overgripImage: e.target.value })
              }
            />
            <Input
              placeholder='Sponsor (optional)'
              name='sponsor'
              value={newPlayer.sponsor}
              onChange={e =>
                setNewPlayer({ ...newPlayer, sponsor: e.target.value })
              }
            />
            <Input
              placeholder='Weight (optional)'
              name='weight'
              value={newPlayer.weight}
              onChange={e =>
                setNewPlayer({ ...newPlayer, weight: e.target.value })
              }
            />
            <Input
              placeholder='Weight Image URL (optional)'
              name='weightImage'
              value={newPlayer.weightImage}
              onChange={e =>
                setNewPlayer({ ...newPlayer, weightImage: e.target.value })
              }
            />
            <Input
              placeholder='Total Weight (optional)'
              name='totalWeight'
              value={newPlayer.totalWeight}
              onChange={e =>
                setNewPlayer({ ...newPlayer, totalWeight: e.target.value })
              }
            />
            <Input
              placeholder='Weight Location (optional)'
              name='weightLocation'
              value={newPlayer.weightLocation}
              onChange={e =>
                setNewPlayer({ ...newPlayer, weightLocation: e.target.value })
              }
            />
            <Input
              placeholder='Tape Details (optional)'
              name='tapeDetails'
              value={newPlayer.tapeDetails}
              onChange={e =>
                setNewPlayer({ ...newPlayer, tapeDetails: e.target.value })
              }
            />
            <Input
              placeholder='Additional Modification (optional)'
              name='additionalModification'
              value={newPlayer.additionalModification}
              onChange={e =>
                setNewPlayer({ ...newPlayer, additionalModification: e.target.value })
              }
            />
            <Input
              placeholder='Additional Modification Image URL (optional)'
              name='additionalModificationImage'
              value={newPlayer.additionalModificationImage}
              onChange={e =>
                setNewPlayer({ ...newPlayer, additionalModificationImage: e.target.value })
              }
            />

            <Button colorScheme='blue' onClick={handleAddPlayer} w='full'>
              Add Player
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;
