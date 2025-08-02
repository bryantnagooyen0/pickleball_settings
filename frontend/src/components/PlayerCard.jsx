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
  useToast,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { useState, useRef } from 'react';

const PlayerCard = ({ player, onPlayerDeleted }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editPlayer, setEditPlayer] = useState(player);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = useRef();
  const toast = useToast();

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/players/${player._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editPlayer)
      });
      
      if (response.ok) {
        onClose();
        toast({
          title: "Success",
          description: "Player updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Refresh the players list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating player:', error);
      toast({
        title: "Error",
        description: "Failed to update player",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/players/${player._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Player deleted successfully",
          status: "success",
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
        title: "Error",
        description: "Failed to delete player",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Box
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
        transition="all 0.2s"
      >
                 <Box 
           p="6" 
           display="flex" 
           justifyContent="center" 
           alignItems="center"
         >
          <Image
            src={player.image}
            alt={player.name}
            borderRadius="full"
            width="160px"
            height="160px"
            objectFit="cover"
            border="4px solid white"
            boxShadow="lg"
          />
        </Box>
        
        <Box p="6">
          <VStack spacing={3} align="start">
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              {player.name}
            </Text>
            
            <Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Paddle:
              </Text>
              <Badge colorScheme="blue" variant="subtle" fontSize="sm">
                {player.paddle}
              </Badge>
            </Box>
            
            {player.shoes && (
              <Box>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Shoes:
                </Text>
                <Badge colorScheme="green" variant="subtle" fontSize="sm">
                  {player.shoes}
                </Badge>
              </Box>
            )}

            <HStack spacing={2} w="full">
              <Button size="sm" colorScheme="blue" onClick={onOpen} flex={1}>
                Edit
              </Button>
              <Button 
                size="sm" 
                colorScheme="red" 
                onClick={() => setIsDeleteOpen(true)}
                flex={1}
              >
                Delete
              </Button>
            </HStack>
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
              <Input
                placeholder='Player Name'
                value={editPlayer.name}
                onChange={(e) => setEditPlayer({ ...editPlayer, name: e.target.value })}
              />
              <Input
                placeholder='Paddle'
                value={editPlayer.paddle}
                onChange={(e) => setEditPlayer({ ...editPlayer, paddle: e.target.value })}
              />
              <Input
                placeholder='Image URL'
                value={editPlayer.image}
                onChange={(e) => setEditPlayer({ ...editPlayer, image: e.target.value })}
              />
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
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Player
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {player.name}? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
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
