import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  VStack,
  Text,
  Box,
  Button,
  Input,
  Textarea,
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
  Center,
  Spinner,
} from '@chakra-ui/react';
import { usePaddleStore } from '../store/paddle';
import { usePlayerStore } from '../store/player';
import { SearchIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

const PaddleManagementPage = () => {
  const { paddles, fetchPaddles, createPaddle, updatePaddle, deletePaddle } =
    usePaddleStore();
  const { refreshPlayers } = usePlayerStore();
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPaddle, setSelectedPaddle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    description: '',
    priceLink: '',
  });

  useEffect(() => {
    const loadPaddles = async () => {
      setIsLoading(true);
      await fetchPaddles();
      setIsLoading(false);
    };
    loadPaddles();
  }, []); // Empty dependency array - only run once on mount

  const filteredPaddles = useMemo(() => {
    if (!searchQuery.trim()) {
      return paddles;
    }
    
    const query = searchQuery.toLowerCase();
    return paddles.filter(
      paddle =>
        paddle.name?.toLowerCase().includes(query) ||
        paddle.brand?.toLowerCase().includes(query) ||
        paddle.model?.toLowerCase().includes(query)
    );
  }, [paddles, searchQuery]);

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

  const handleEdit = paddle => {
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
      description: paddle.description || '',
      priceLink: paddle.priceLink || '',
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
      description: '',
      priceLink: '',
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
      description: '',
      priceLink: '',
    });
    onOpen();
  };

  const handlePaddleClick = (paddle) => {
    navigate(`/paddle/${paddle._id}`);
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePaddleMouseDown = (e, paddle) => {
    // Middle-click or Ctrl/Cmd + left-click opens in new tab
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      openInNewTab(`/paddle/${paddle._id}`);
    }
  };

  const handleButtonClick = (e, action, paddle) => {
    e.stopPropagation();
    if (action === 'edit') {
      handleEdit(paddle);
    } else if (action === 'delete') {
      setSelectedPaddle(paddle);
      setIsDeleteOpen(true);
    }
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
          Paddle List
        </Text>

        <HStack w='full' justify='space-between'>
          <Box flex={1} maxW='md'>
            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <SearchIcon color='gray.400' />
              </InputLeftElement>
              <Input
                placeholder='Search paddles...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                bg='white'
                border='2px'
                borderColor='gray.200'
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px blue.500',
                }}
              />
            </InputGroup>
          </Box>

          {getRoleFromToken() === 'admin' && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme='blue'
              onClick={handleAddNew}
            >
              Add New Paddle
            </Button>
          )}
        </HStack>

        {isLoading ? (
          <Center py={12}>
            <Spinner size='xl' />
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w='full'>
            {filteredPaddles.map(paddle => (
            <Box
              key={paddle._id}
              bg={'white'}
              p={6}
              rounded='lg'
              shadow='md'
              border='1px'
              borderColor='gray.200'
              cursor='pointer'
              _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
              transition='all 0.2s'
              onClick={() => handlePaddleClick(paddle)}
              onMouseDown={(e) => handlePaddleMouseDown(e, paddle)}
            >
              <VStack spacing={4} align='start'>
                <Image
                  src={paddle.image || '/unknownPaddle.png'}
                  alt={paddle.name}
                  borderRadius='md'
                  w='full'
                  h='200px'
                  objectFit='contain'
                  bg='white'
                />

                <VStack spacing={2} align='start' w='full'>
                  <Text fontSize='xl' fontWeight='bold'>
                    {paddle.name}
                  </Text>
                  <Text fontSize='md' color='gray.600'>
                    {paddle.model}
                  </Text>

                  <HStack spacing={2} flexWrap='wrap' justify='space-between' w='full'>
                    <HStack spacing={2} flexWrap='wrap'>
                      {paddle.shape && (
                        <Badge colorScheme='blue' variant='subtle'>
                          {paddle.shape}
                        </Badge>
                      )}
                      {paddle.thickness && (
                        <Badge colorScheme='green' variant='subtle'>
                          {paddle.thickness}
                        </Badge>
                      )}
                      {paddle.weight && (
                        <Badge colorScheme='purple' variant='subtle'>
                          {paddle.weight}
                        </Badge>
                      )}
                    </HStack>
                    {paddle.brand && (
                      <Badge colorScheme='red' variant='subtle'>
                        {paddle.brand}
                      </Badge>
                    )}
                  </HStack>

                  {paddle.description && (
                    <Text fontSize='sm' color='gray.500' noOfLines={2}>
                      {paddle.description}
                    </Text>
                  )}
                </VStack>

                {getRoleFromToken() === 'admin' && (
                  <HStack spacing={2} w='full'>
                    <Tooltip label='Edit Paddle'>
                      <IconButton
                        icon={<EditIcon />}
                        size='sm'
                        colorScheme='blue'
                        variant='outline'
                        onClick={(e) => handleButtonClick(e, 'edit', paddle)}
                      />
                    </Tooltip>
                    <Tooltip label='Delete Paddle'>
                      <IconButton
                        icon={<DeleteIcon />}
                        size='sm'
                        colorScheme='red'
                        variant='outline'
                        onClick={(e) => handleButtonClick(e, 'delete', paddle)}
                      />
                    </Tooltip>
                  </HStack>
                )}
              </VStack>
            </Box>
          ))}
          </SimpleGrid>
        )}

        {!isLoading && filteredPaddles.length === 0 && (
          <Text fontSize='xl' textAlign='center' color='gray.500'>
            {searchQuery
              ? 'No paddles found matching your search'
              : 'No paddles found'}
          </Text>
        )}
      </VStack>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Paddle' : 'Add New Paddle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Input
                placeholder='Paddle Name'
                value={paddleForm.name}
                onChange={e =>
                  setPaddleForm({ ...paddleForm, name: e.target.value })
                }
              />
              <HStack spacing={4} w='full'>
                <Input
                  placeholder='Brand'
                  value={paddleForm.brand}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, brand: e.target.value })
                  }
                />
                <Input
                  placeholder='Model'
                  value={paddleForm.model}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, model: e.target.value })
                  }
                />
              </HStack>
              <HStack spacing={4} w='full'>
                <Input
                  placeholder='Shape'
                  value={paddleForm.shape}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, shape: e.target.value })
                  }
                />
                <Input
                  placeholder='Thickness'
                  value={paddleForm.thickness}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, thickness: e.target.value })
                  }
                />
              </HStack>
              <HStack spacing={4} w='full'>
                <Input
                  placeholder='Handle Length'
                  value={paddleForm.handleLength}
                  onChange={e =>
                    setPaddleForm({
                      ...paddleForm,
                      handleLength: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder='Paddle Length'
                  value={paddleForm.length}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, length: e.target.value })
                  }
                />
              </HStack>
              <HStack spacing={4} w='full'>
                <Input
                  placeholder='Paddle Width'
                  value={paddleForm.width}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, width: e.target.value })
                  }
                />
                <Input
                  placeholder='Core'
                  value={paddleForm.core}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, core: e.target.value })
                  }
                />
              </HStack>
              <Input
                placeholder='Image URL'
                value={paddleForm.image}
                onChange={e =>
                  setPaddleForm({ ...paddleForm, image: e.target.value })
                }
              />
              <Input
                placeholder='Price Link (e.g., Amazon, manufacturer website)'
                value={paddleForm.priceLink}
                onChange={e =>
                  setPaddleForm({ ...paddleForm, priceLink: e.target.value })
                }
              />
              <Textarea
                placeholder='Description'
                value={paddleForm.description}
                onChange={e =>
                  setPaddleForm({ ...paddleForm, description: e.target.value })
                }
                rows={3}
              />
              <HStack spacing={4} w='full'>
                <Button colorScheme='blue' onClick={handleSubmit} flex={1}>
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
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Paddle
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{selectedPaddle?.name}"? This
              action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleDelete} ml={3}>
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
