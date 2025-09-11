import React from 'react';
import {
  Box,
  Image,
  Text,
  VStack,
  Badge,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  useToast,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const PlayerCard = ({ player, onPlayerDeleted }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editPlayer, setEditPlayer] = useState({
    ...player,
    paddleShape: player.paddleShape || '',
    paddleThickness: player.paddleThickness || '',
    paddleHandleLength: player.paddleHandleLength || '',
    paddleColor: player.paddleColor || '',
    paddleImage: player.paddleImage || '',
    shoeImage: player.shoeImage || '',
    shoeModel: player.shoeModel || '',
    age: player.age || '',
    height: player.height || '',
    mlpTeam: player.mlpTeam || '',
    currentLocation: player.currentLocation || '',
    about: player.about || '',
    overgrips: player.overgrips || '',
    overgripImage: player.overgripImage || '',
    weight: player.weight || '',
    weightImage: player.weightImage || '',
    totalWeight: player.totalWeight || '',
    weightLocation: player.weightLocation || '',
    tapeDetails: player.tapeDetails || '',
    additionalModification: player.additionalModification || '',
    additionalModificationImage: player.additionalModificationImage || '',
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();

  const handleUpdate = async () => {
    try {
      const updatedPlayer = await api.put(`/api/players/${player._id}`, editPlayer);
        onClose();
        toast({
          title: 'Success',
          description: 'Player updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Update the local player data
        Object.assign(player, updatedPlayer.data);
        // Force a re-render by updating the component
        setEditPlayer({ ...editPlayer, ...updatedPlayer.data });
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating player:', error);
      toast({
        title: 'Error',
        description: 'Failed to update player',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/players/${player._id}`);
        toast({
          title: 'Success',
          description: 'Player deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setIsDeleteOpen(false);
        // Call the callback to refresh the players list
        if (onPlayerDeleted) {
          onPlayerDeleted();
        } else {
          window.location.reload();
        }
      } else {
        throw new Error('Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete player',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/player/${player._id}`);
  };

  const handleButtonClick = (e, action) => {
    e.stopPropagation();
    if (action === 'edit') {
      onOpen();
    } else if (action === 'delete') {
      setIsDeleteOpen(true);
    }
  };

  return (
    <>
      <Box
        maxW='sm'
        borderWidth='1px'
        borderRadius='lg'
        overflow='hidden'
        boxShadow='md'
        bg='white'
        _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
        transition='all 0.2s'
        cursor='pointer'
        onClick={handleCardClick}
      >
        <Box p='6' display='flex' justifyContent='center' alignItems='center'>
          <Image
            src={player.image}
            alt={player.name}
            borderRadius='full'
            width='160px'
            height='160px'
            objectFit='cover'
            border='4px solid white'
            boxShadow='lg'
          />
        </Box>

        <Box p='6'>
          <VStack spacing={3} align='start'>
            <Text fontSize='xl' fontWeight='bold' color='gray.800'>
              {player.name}
            </Text>

            <HStack
              spacing={4}
              w='full'
              align='start'
              justifyContent='space-between'
            >
              <Box>
                <Text fontSize='sm' color='gray.600' fontWeight='medium'>
                  Paddle:
                </Text>
                <Badge colorScheme='blue' variant='subtle' fontSize='sm'>
                  {player.paddle}
                </Badge>
              </Box>

              {player.sponsor && (
                <Box>
                  <Text fontSize='sm' color='gray.600' fontWeight='medium'>
                    Sponsor:
                  </Text>
                  <Badge colorScheme='purple' variant='subtle' fontSize='sm'>
                    {player.sponsor}
                  </Badge>
                </Box>
              )}
            </HStack>

            {player.shoes && (
              <Box>
                <Text fontSize='sm' color='gray.600' fontWeight='medium'>
                  Shoes:
                </Text>
                <Badge colorScheme='green' variant='subtle' fontSize='sm'>
                  {player.shoes}
                </Badge>
              </Box>
            )}

            {getRoleFromToken() === 'admin' && (
              <HStack spacing={2} w='full'>
                <Button
                  size='sm'
                  colorScheme='blue'
                  onClick={e => handleButtonClick(e, 'edit')}
                  flex={1}
                >
                  Edit
                </Button>
                <Button
                  size='sm'
                  colorScheme='red'
                  onClick={e => handleButtonClick(e, 'delete')}
                  flex={1}
                >
                  Delete
                </Button>
              </HStack>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Player</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} pb={4}>
              <FormControl>
                <FormLabel>Player Name</FormLabel>
                <Input
                  placeholder='Enter player name'
                  value={editPlayer.name}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, name: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Paddle</FormLabel>
                <Input
                  placeholder='Enter paddle model'
                  value={editPlayer.paddle}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, paddle: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Paddle Shape</FormLabel>
                <Input
                  placeholder='Enter paddle shape (optional)'
                  value={editPlayer.paddleShape}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, paddleShape: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Paddle Thickness</FormLabel>
                <Input
                  placeholder='Enter paddle thickness (optional)'
                  value={editPlayer.paddleThickness}
                  onChange={e =>
                    setEditPlayer({
                      ...editPlayer,
                      paddleThickness: e.target.value,
                    })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Paddle Handle Length</FormLabel>
                <Input
                  placeholder='Enter handle length (optional)'
                  value={editPlayer.paddleHandleLength}
                  onChange={e =>
                    setEditPlayer({
                      ...editPlayer,
                      paddleHandleLength: e.target.value,
                    })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Paddle Color</FormLabel>
                <Input
                  placeholder='Enter paddle color (optional)'
                  value={editPlayer.paddleColor}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, paddleColor: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Paddle Image URL</FormLabel>
                <Input
                  placeholder='Enter paddle image URL (optional)'
                  value={editPlayer.paddleImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, paddleImage: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Player Image URL</FormLabel>
                <Input
                  placeholder='Enter player image URL'
                  value={editPlayer.image}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, image: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Age</FormLabel>
                <Input
                  placeholder='Enter age (optional)'
                  type='number'
                  value={editPlayer.age}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, age: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Height</FormLabel>
                <Input
                  placeholder='Enter height (optional)'
                  value={editPlayer.height}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, height: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>MLP Team</FormLabel>
                <Input
                  placeholder='Enter MLP team (optional)'
                  value={editPlayer.mlpTeam}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, mlpTeam: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Current Location</FormLabel>
                <Input
                  placeholder='Enter current location (optional)'
                  value={editPlayer.currentLocation}
                  onChange={e =>
                    setEditPlayer({
                      ...editPlayer,
                      currentLocation: e.target.value,
                    })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>About</FormLabel>
                <Textarea
                  placeholder='Enter player description (optional)'
                  value={editPlayer.about}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, about: e.target.value })
                  }
                  rows={4}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Shoe Image URL</FormLabel>
                <Input
                  placeholder='Enter shoe image URL (optional)'
                  value={editPlayer.shoeImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, shoeImage: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Shoe Model</FormLabel>
                <Input
                  placeholder='Enter shoe model (optional)'
                  value={editPlayer.shoeModel}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, shoeModel: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Overgrips</FormLabel>
                <Input
                  placeholder='Enter overgrips (optional)'
                  value={editPlayer.overgrips}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, overgrips: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Overgrip Image URL</FormLabel>
                <Input
                  placeholder='Enter overgrip image URL (optional)'
                  value={editPlayer.overgripImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, overgripImage: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Sponsor</FormLabel>
                <Input
                  placeholder='Enter sponsor (optional)'
                  value={editPlayer.sponsor}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, sponsor: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Weight</FormLabel>
                <Input
                  placeholder='Enter weight (optional)'
                  value={editPlayer.weight}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, weight: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Weight Image URL</FormLabel>
                <Input
                  placeholder='Enter weight image URL (optional)'
                  value={editPlayer.weightImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, weightImage: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Total Weight</FormLabel>
                <Input
                  placeholder='Enter total weight (optional)'
                  value={editPlayer.totalWeight}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, totalWeight: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Weight Location</FormLabel>
                <Input
                  placeholder='Enter weight location (optional)'
                  value={editPlayer.weightLocation}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, weightLocation: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Tape Details</FormLabel>
                <Input
                  placeholder='Enter tape details (optional)'
                  value={editPlayer.tapeDetails}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, tapeDetails: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Additional Modification</FormLabel>
                <Input
                  placeholder='Enter additional modification (optional)'
                  value={editPlayer.additionalModification}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, additionalModification: e.target.value })
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Additional Modification Image URL</FormLabel>
                <Input
                  placeholder='Enter additional modification image URL (optional)'
                  value={editPlayer.additionalModificationImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, additionalModificationImage: e.target.value })
                  }
                />
              </FormControl>
              
              <Button colorScheme='blue' onClick={handleUpdate} w='full'>
                Update Player
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Player
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {player.name}? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
                loadingText='Deleting...'
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default PlayerCard;
