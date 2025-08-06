import React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { usePlayerStore } from '../store/player';

const CreatePage = () => {
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    paddle: '',
    paddleShape: '',
    paddleThickness: '',
    paddleHandleLength: '',
    paddleColor: '',
    paddleImage: '',
    image: '',
    age: '',
    height: '',
    mlpTeam: '',
    currentLocation: '',
    shoeImage: '',
    shoeModel: '',
    overgrips: '',
    weight: '',
  });

  const toast = useToast();

  const { createPlayer } = usePlayerStore();

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
      paddleShape: '',
      paddleThickness: '',
      paddleHandleLength: '',
      paddleColor: '',
      paddleImage: '',
      image: '',
      age: '',
      height: '',
      mlpTeam: '',
      currentLocation: '',
      shoeImage: '',
      shoeModel: '',
      overgrips: '',
      weight: '',
    });
  };

  return (
    <Container maxW={'container.sm'}>
      <VStack spacing={8}>
        <Heading as={'h1'} size={'2xl'} textAlign={'center'} mb={8}>
          Create New Player
        </Heading>

        <Box
          w={'full'}
          bg={useColorModeValue('white', 'gray.800')}
          p={6}
          rounded={'lg'}
          shadow={'md'}
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
            <Input
              placeholder='Paddle'
              name='paddle'
              value={newPlayer.paddle}
              onChange={e =>
                setNewPlayer({ ...newPlayer, paddle: e.target.value })
              }
            />
            <Input
              placeholder='Paddle Shape (optional)'
              name='paddleShape'
              value={newPlayer.paddleShape}
              onChange={e =>
                setNewPlayer({ ...newPlayer, paddleShape: e.target.value })
              }
            />
            <Input
              placeholder='Paddle Thickness (optional)'
              name='paddleThickness'
              value={newPlayer.paddleThickness}
              onChange={e =>
                setNewPlayer({ ...newPlayer, paddleThickness: e.target.value })
              }
            />
            <Input
              placeholder='Paddle Handle Length (optional)'
              name='paddleHandleLength'
              value={newPlayer.paddleHandleLength}
              onChange={e =>
                setNewPlayer({
                  ...newPlayer,
                  paddleHandleLength: e.target.value,
                })
              }
            />
            <Input
              placeholder='Paddle Color (optional)'
              name='paddleColor'
              value={newPlayer.paddleColor}
              onChange={e =>
                setNewPlayer({ ...newPlayer, paddleColor: e.target.value })
              }
            />
            <Input
              placeholder='Paddle Image URL (optional)'
              name='paddleImage'
              value={newPlayer.paddleImage}
              onChange={e =>
                setNewPlayer({ ...newPlayer, paddleImage: e.target.value })
              }
            />
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
              placeholder='Weight (optional)'
              name='weight'
              value={newPlayer.weight}
              onChange={e =>
                setNewPlayer({ ...newPlayer, weight: e.target.value })
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
