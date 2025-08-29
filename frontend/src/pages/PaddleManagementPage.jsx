import React, { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  Text,
  Box,
  Button,
  Input,
  Textarea,
  useColorModeValue,
  useToast,
  SimpleGrid,
  HStack,
  Badge,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Tooltip,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { usePaddleStore } from '../store/paddle';
import { usePlayerStore } from '../store/player';
import { SearchIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useRef } from 'react';

const PaddleManagementPage = () => {
  const { paddles, fetchPaddles, createPaddle, updatePaddle, deletePaddle } = usePaddleStore();
  const { refreshPlayers } = usePlayerStore();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPaddle, setSelectedPaddle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const cancelRef = useRef();

  const [paddleForm, setPaddleForm] = useState({
    name: '',
    brand: '',
    model: '',
    shape: '',
    thickness: '',
    handleLength: '',
    length: '',
    width: '',
    core: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    fetchPaddles();
  }, [fetchPaddles]);

  const filteredPaddles = paddles.filter(paddle =>
    paddle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paddle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paddle.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!paddleForm.name || !paddleForm.brand) {
      toast({
        title: 'Error',
        description: 'Please fill in name and brand',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = isEditing 
      ? await updatePaddle(selectedPaddle._id, paddleForm)
      : await createPaddle(paddleForm);

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // If this was an update, refresh player data to reflect the changes
      if (isEditing) {
        await refreshPlayers();
      }
      
      handleClose();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (paddle) => {
    setSelectedPaddle(paddle);
    setPaddleForm({
      name: paddle.name,
      brand: paddle.brand,
      model: paddle.model,
      shape: paddle.shape || '',
      thickness: paddle.thickness || '',
      handleLength: paddle.handleLength || '',
      length: paddle.length || '',
      width: paddle.width || '',
      core: paddle.core || '',
      image: paddle.image || '',
      description: paddle.description || ''
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async () => {
    if (!selectedPaddle) return;

    const result = await deletePaddle(selectedPaddle._id);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsDeleteOpen(false);
    setSelectedPaddle(null);
  };

  const handleClose = () => {
    setPaddleForm({
      name: '',
      brand: '',
      model: '',
      shape: '',
      thickness: '',
      handleLength: '',
      length: '',
      width: '',
      core: '',
      image: '',
      description: ''
    });
    setSelectedPaddle(null);
    setIsEditing(false);
    onClose();
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setPaddleForm({
      name: '',
      brand: '',
      model: '',
      shape: '',
      thickness: '',
      handleLength: '',
      length: '',
      width: '',
      core: '',
      image: '',
      description: ''
    });
    onOpen();
  };

  return (
    <Container maxW='container.xl' py={8}>
      <VStack spacing={6}>
        <Text
          fontSize={'30'}
          fontWeight={'bold'}
          bgGradient={'linear(to-r, cyan.400, blue.500)'}
          bgClip={'text'}
          textAlign={'center'}
        >
          Paddle Management
        </Text>

        <HStack w="full" justify="space-between">
          <Box flex={1} maxW="md">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search paddles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                border="2px"
                borderColor="gray.200"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px blue.500",
                }}
              />
            </InputGroup>
          </Box>
          
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddNew}
          >
            Add New Paddle
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
          {filteredPaddles.map(paddle => (
            <Box
              key={paddle._id}
              bg={useColorModeValue('white', 'gray.800')}
              p={6}
              rounded="lg"
              shadow="md"
              border="1px"
              borderColor="gray.200"
            >
              <VStack spacing={4} align="start">
                {paddle.image && (
                  <Image
                    src={paddle.image}
                    alt={paddle.name}
                    borderRadius="md"
                    w="full"
                    h="200px"
                    objectFit="cover"
                  />
                )}
                
                <VStack spacing={2} align="start" w="full">
                  <Text fontSize="xl" fontWeight="bold">
                    {paddle.name}
                  </Text>
                  <Text fontSize="md" color="gray.600">
                    {paddle.brand} - {paddle.model}
                  </Text>
                  
                  <HStack spacing={2} flexWrap="wrap">
                    {paddle.shape && (
                      <Badge colorScheme="blue" variant="subtle">
                        {paddle.shape}
                      </Badge>
                    )}
                    {paddle.thickness && (
                      <Badge colorScheme="green" variant="subtle">
                        {paddle.thickness}
                      </Badge>
                    )}
                    {paddle.weight && (
                      <Badge colorScheme="purple" variant="subtle">
                        {paddle.weight}
                      </Badge>
                    )}
                  </HStack>

                  {paddle.description && (
                    <Text fontSize="sm" color="gray.500" noOfLines={2}>
                      {paddle.description}
                    </Text>
                  )}
                </VStack>

                <HStack spacing={2} w="full">
                  <Tooltip label="Edit Paddle">
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleEdit(paddle)}
                    />
                  </Tooltip>
                  <Tooltip label="Delete Paddle">
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        setSelectedPaddle(paddle);
                        setIsDeleteOpen(true);
                      }}
                    />
                  </Tooltip>
                </HStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        {filteredPaddles.length === 0 && (
          <Text fontSize="xl" textAlign="center" color="gray.500">
            {searchQuery ? 'No paddles found matching your search' : 'No paddles found'}
          </Text>
        )}
      </VStack>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Paddle' : 'Add New Paddle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Input
                placeholder="Paddle Name"
                value={paddleForm.name}
                onChange={(e) => setPaddleForm({...paddleForm, name: e.target.value})}
              />
              <HStack spacing={4} w="full">
                <Input
                  placeholder="Brand"
                  value={paddleForm.brand}
                  onChange={(e) => setPaddleForm({...paddleForm, brand: e.target.value})}
                />
                <Input
                  placeholder="Model"
                  value={paddleForm.model}
                  onChange={(e) => setPaddleForm({...paddleForm, model: e.target.value})}
                />
              </HStack>
              <HStack spacing={4} w="full">
                <Input
                  placeholder="Shape"
                  value={paddleForm.shape}
                  onChange={(e) => setPaddleForm({...paddleForm, shape: e.target.value})}
                />
                <Input
                  placeholder="Thickness"
                  value={paddleForm.thickness}
                  onChange={(e) => setPaddleForm({...paddleForm, thickness: e.target.value})}
                />
              </HStack>
              <HStack spacing={4} w="full">
                <Input
                  placeholder="Handle Length"
                  value={paddleForm.handleLength}
                  onChange={(e) => setPaddleForm({...paddleForm, handleLength: e.target.value})}
                />
                <Input
                  placeholder="Paddle Length"
                  value={paddleForm.length}
                  onChange={(e) => setPaddleForm({...paddleForm, length: e.target.value})}
                />
              </HStack>
              <HStack spacing={4} w="full">
                <Input
                  placeholder="Paddle Width"
                  value={paddleForm.width}
                  onChange={(e) => setPaddleForm({...paddleForm, width: e.target.value})}
                />
                <Input
                  placeholder="Core"
                  value={paddleForm.core}
                  onChange={(e) => setPaddleForm({...paddleForm, core: e.target.value})}
                />
              </HStack>
              <Input
                placeholder="Image URL"
                value={paddleForm.image}
                onChange={(e) => setPaddleForm({...paddleForm, image: e.target.value})}
              />
              <Textarea
                placeholder="Description"
                value={paddleForm.description}
                onChange={(e) => setPaddleForm({...paddleForm, description: e.target.value})}
                rows={3}
              />
              <HStack spacing={4} w="full">
                <Button colorScheme="blue" onClick={handleSubmit} flex={1}>
                  {isEditing ? 'Update' : 'Create'} Paddle
                </Button>
                <Button onClick={handleClose} flex={1}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Paddle
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{selectedPaddle?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default PaddleManagementPage;
