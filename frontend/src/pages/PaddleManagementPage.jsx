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
  Heading,
  Divider,
} from '@chakra-ui/react';
import { usePaddleStore } from '../store/paddle';
import { usePlayerStore } from '../store/player';
import { SearchIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

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

  // Editorial color palette - matching landing page
  const bgColor = '#FAF7ED';
  const primaryColor = '#AE573E';
  const primaryDark = '#8B4532';
  const textPrimary = '#161412';
  const textSecondary = '#6B7280';
  const accentBg = '#F5F1E3';
  const borderColor = '#E5E7EB';

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
  }, []);

  // When landing on paddles list, ensure player scroll flags never affect this page
  useEffect(() => {
    sessionStorage.removeItem('restorePlayerListScroll');
    sessionStorage.removeItem('playerListScrollPosition');
  }, []);

  // If not restoring from paddle detail, always start at top on initial mount
  useEffect(() => {
    const shouldRestore = sessionStorage.getItem('restorePaddleListScroll') === 'true';
    if (!shouldRestore) {
      window.scrollTo(0, 0);
    }
  }, []);

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

  // Scroll position restoration (only when flagged as coming from the paddles list)
  useEffect(() => {
    const shouldRestore = sessionStorage.getItem('restorePaddleListScroll') === 'true';
    const savedScrollPosition = sessionStorage.getItem('paddleListScrollPosition');
    if (shouldRestore && savedScrollPosition && filteredPaddles.length > 0) {
      const restoreScroll = () => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('paddleListScrollPosition');
        sessionStorage.removeItem('restorePaddleListScroll');
      };
      requestAnimationFrame(() => {
        requestAnimationFrame(restoreScroll);
      });
    } else if (!shouldRestore) {
      sessionStorage.removeItem('restorePaddleListScroll');
    }
  }, [filteredPaddles]);

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
    // Only save and mark for restore when coming from the paddles list page
    sessionStorage.setItem('paddleListScrollPosition', window.pageYOffset.toString());
    sessionStorage.setItem('restorePaddleListScroll', 'true');
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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={{ base: 8, md: 12 }}>
      <Container maxW='container.xl'>
        <MotionVStack
          spacing={{ base: 8, md: 12 }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {/* Header Section - Editorial Style */}
          <MotionBox variants={fadeInUp} w="full">
            <HStack spacing={4} mb={6}>
              <Box w="60px" h="3px" bg={primaryColor} />
              <Text
                fontSize="xs"
                fontWeight="700"
                color={primaryColor}
                letterSpacing="0.2em"
                textTransform="uppercase"
              >
                All Paddles
              </Text>
            </HStack>
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
              color={textPrimary}
              fontWeight="900"
              letterSpacing="-0.04em"
              lineHeight="1"
            >
              Paddle
              <Box as="span" display="block" color={primaryColor} mt={2}>
                Collection
              </Box>
            </Heading>
          </MotionBox>

          {/* Search and Add Button - Editorial Style */}
          <MotionBox variants={fadeInUp} w='full'>
            <HStack w='full' justify='space-between' spacing={4}>
              <Box flex={1} maxW='md'>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents='none' h="full" pl={6}>
                    <SearchIcon color={textSecondary} boxSize={5} />
                  </InputLeftElement>
                  <Input
                    placeholder='Search paddles...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    bg="white"
                    color={textPrimary}
                    h="64px"
                    pl={14}
                    fontSize="lg"
                    border="2px solid"
                    borderColor={borderColor}
                    borderRadius="none"
                    _placeholder={{ color: textSecondary, fontStyle: "italic" }}
                    _focus={{
                      borderColor: primaryColor,
                      borderWidth: "3px",
                      boxShadow: "none",
                      bg: "white",
                    }}
                    _hover={{
                      borderColor: primaryColor,
                    }}
                    transition="all 0.2s"
                  />
                </InputGroup>
              </Box>

              {getRoleFromToken() === 'admin' && (
                <Button
                  leftIcon={<AddIcon />}
                  bg={primaryColor}
                  color="white"
                  onClick={handleAddNew}
                  h="64px"
                  px={8}
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={primaryColor}
                  fontWeight="700"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  fontSize="md"
                  _hover={{
                    bg: primaryDark,
                    transform: "translateX(2px)",
                  }}
                  _active={{
                    transform: "translateX(0)",
                  }}
                  transition="all 0.2s"
                >
                  Add New Paddle
                </Button>
              )}
            </HStack>
          </MotionBox>

          {/* Editorial Divider */}
          {!isLoading && filteredPaddles.length > 0 && (
            <Box w="full" py={2}>
              <HStack spacing={4}>
                <Box flex="1" h="2px" bg={primaryColor} />
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color={primaryColor}
                  letterSpacing="0.2em"
                  textTransform="uppercase"
                  px={4}
                >
                  Results
                </Text>
                <Box flex="1" h="2px" bg={primaryColor} />
              </HStack>
            </Box>
          )}

          {/* Paddles Grid */}
          {isLoading ? (
            <Center py={12}>
              <Spinner size='xl' color={primaryColor} thickness="4px" />
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w='full'>
              {filteredPaddles.map((paddle, index) => (
                <MotionBox
                  key={paddle._id}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Box
                    bg={accentBg}
                    p={6}
                    borderRadius="none"
                    borderWidth="2px"
                    borderColor={borderColor}
                    cursor='pointer'
                    _hover={{
                      borderColor: primaryColor,
                      transform: "translateY(-4px)",
                    }}
                    transition='all 0.3s'
                    onClick={() => handlePaddleClick(paddle)}
                    onMouseDown={(e) => handlePaddleMouseDown(e, paddle)}
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      w="4px"
                      h="full"
                      bg={primaryColor}
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                    />
                    <VStack spacing={4} align='start'>
                      <Image
                        src={paddle.image || '/unknownPaddle.png'}
                        alt={paddle.name}
                        borderRadius="none"
                        w='full'
                        h='200px'
                        objectFit='contain'
                        bg='white'
                        borderWidth="1px"
                        borderColor={borderColor}
                      />

                      <VStack spacing={3} align='start' w='full'>
                        <Heading
                          fontSize='xl'
                          fontWeight='900'
                          color={textPrimary}
                          letterSpacing="-0.02em"
                        >
                          {paddle.name}
                        </Heading>
                        <Text
                          fontSize='md'
                          color={textSecondary}
                          fontWeight="600"
                        >
                          {paddle.model}
                        </Text>

                        <HStack spacing={2} flexWrap='wrap' justify='space-between' w='full'>
                          <HStack spacing={2} flexWrap='wrap'>
                            {paddle.shape && (
                              <Badge
                                px={3}
                                py={1}
                                borderRadius="none"
                                bg={primaryColor}
                                color="white"
                                fontSize="xs"
                                fontWeight="700"
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                              >
                                {paddle.shape}
                              </Badge>
                            )}
                            {paddle.thickness && (
                              <Badge
                                px={3}
                                py={1}
                                borderRadius="none"
                                bg={textPrimary}
                                color="white"
                                fontSize="xs"
                                fontWeight="700"
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                              >
                                {paddle.thickness}
                              </Badge>
                            )}
                            {paddle.weight && (
                              <Badge
                                px={3}
                                py={1}
                                borderRadius="none"
                                bg={textSecondary}
                                color="white"
                                fontSize="xs"
                                fontWeight="700"
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                              >
                                {paddle.weight}
                              </Badge>
                            )}
                          </HStack>
                          {paddle.brand && (
                            <Badge
                              px={3}
                              py={1}
                              borderRadius="none"
                              bg={primaryColor}
                              color="white"
                              fontSize="xs"
                              fontWeight="700"
                              textTransform="uppercase"
                              letterSpacing="0.05em"
                            >
                              {paddle.brand}
                            </Badge>
                          )}
                        </HStack>

                        {paddle.description && (
                          <Text
                            fontSize='sm'
                            color={textSecondary}
                            noOfLines={2}
                            lineHeight="1.6"
                          >
                            {paddle.description}
                          </Text>
                        )}
                      </VStack>

                      {getRoleFromToken() === 'admin' && (
                        <HStack spacing={2} w='full' pt={2} borderTopWidth="1px" borderColor={borderColor}>
                          <Tooltip label='Edit Paddle'>
                            <IconButton
                              icon={<EditIcon />}
                              size='sm'
                              bg={primaryColor}
                              color="white"
                              variant='solid'
                              borderRadius="none"
                              borderWidth="2px"
                              borderColor={primaryColor}
                              _hover={{
                                bg: primaryDark,
                              }}
                              onClick={(e) => handleButtonClick(e, 'edit', paddle)}
                            />
                          </Tooltip>
                          <Tooltip label='Delete Paddle'>
                            <IconButton
                              icon={<DeleteIcon />}
                              size='sm'
                              bg={textPrimary}
                              color="white"
                              variant='solid'
                              borderRadius="none"
                              borderWidth="2px"
                              borderColor={textPrimary}
                              _hover={{
                                bg: textSecondary,
                              }}
                              onClick={(e) => handleButtonClick(e, 'delete', paddle)}
                            />
                          </Tooltip>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          )}

          {/* Empty State - Editorial Style */}
          {!isLoading && filteredPaddles.length === 0 && (
            <MotionBox variants={fadeInUp} textAlign="center" py={16}>
              <Box
                p={12}
                bg={accentBg}
                borderWidth="2px"
                borderColor={borderColor}
                borderRadius="none"
                maxW="2xl"
                mx="auto"
              >
                <VStack spacing={6}>
                  <Heading
                    fontSize={{ base: "2xl", md: "3xl" }}
                    color={textPrimary}
                    fontWeight="900"
                    letterSpacing="-0.02em"
                  >
                    No Paddles Found
                  </Heading>
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    color={textSecondary}
                    lineHeight="1.7"
                    fontStyle="italic"
                  >
                    {searchQuery
                      ? 'No paddles match your search criteria. Try adjusting your search terms.'
                      : 'No paddles in the database yet.'}
                  </Text>
                </VStack>
              </Box>
            </MotionBox>
          )}
        </MotionVStack>
      </Container>

      {/* Add/Edit Modal - Editorial Style */}
      <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
        <ModalOverlay />
        <ModalContent bg={bgColor} borderRadius="none">
          <ModalHeader
            borderBottomWidth="2px"
            borderColor={primaryColor}
            bg={accentBg}
            py={6}
          >
            <HStack spacing={3}>
              <Box w="40px" h="2px" bg={primaryColor} />
              <Text
                fontSize="lg"
                fontWeight="900"
                color={textPrimary}
                letterSpacing="-0.02em"
                textTransform="uppercase"
              >
                {isEditing ? 'Edit Paddle' : 'Add New Paddle'}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            borderRadius="none"
            borderWidth="2px"
            borderColor={textPrimary}
            color={textPrimary}
            _hover={{
              bg: textPrimary,
              color: "white",
            }}
          />
          <ModalBody pb={8} pt={6}>
            <VStack spacing={4}>
              <Input
                placeholder='Paddle Name'
                value={paddleForm.name}
                onChange={e =>
                  setPaddleForm({ ...paddleForm, name: e.target.value })
                }
                borderRadius="none"
                borderWidth="2px"
                borderColor={borderColor}
                _focus={{
                  borderColor: primaryColor,
                  borderWidth: "3px",
                }}
                _hover={{
                  borderColor: primaryColor,
                }}
              />
              <HStack spacing={4} w='full'>
                <Input
                  placeholder='Brand'
                  value={paddleForm.brand}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, brand: e.target.value })
                  }
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: primaryColor,
                    borderWidth: "3px",
                  }}
                  _hover={{
                    borderColor: primaryColor,
                  }}
                />
                <Input
                  placeholder='Model'
                  value={paddleForm.model}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, model: e.target.value })
                  }
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: primaryColor,
                    borderWidth: "3px",
                  }}
                  _hover={{
                    borderColor: primaryColor,
                  }}
                />
              </HStack>
              <HStack spacing={4} w='full'>
                <Input
                  placeholder='Shape'
                  value={paddleForm.shape}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, shape: e.target.value })
                  }
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: primaryColor,
                    borderWidth: "3px",
                  }}
                  _hover={{
                    borderColor: primaryColor,
                  }}
                />
                <Input
                  placeholder='Thickness'
                  value={paddleForm.thickness}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, thickness: e.target.value })
                  }
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: primaryColor,
                    borderWidth: "3px",
                  }}
                  _hover={{
                    borderColor: primaryColor,
                  }}
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
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: primaryColor,
                    borderWidth: "3px",
                  }}
                  _hover={{
                    borderColor: primaryColor,
                  }}
                />
                <Input
                  placeholder='Paddle Length'
                  value={paddleForm.length}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, length: e.target.value })
                  }
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: primaryColor,
                    borderWidth: "3px",
                  }}
                  _hover={{
                    borderColor: primaryColor,
                  }}
                />
              </HStack>
              <HStack spacing={4} w='full'>
                <Input
                  placeholder='Paddle Width'
                  value={paddleForm.width}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, width: e.target.value })
                  }
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: primaryColor,
                    borderWidth: "3px",
                  }}
                  _hover={{
                    borderColor: primaryColor,
                  }}
                />
                <Input
                  placeholder='Core'
                  value={paddleForm.core}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, core: e.target.value })
                  }
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: primaryColor,
                    borderWidth: "3px",
                  }}
                  _hover={{
                    borderColor: primaryColor,
                  }}
                />
              </HStack>
              <Input
                placeholder='Image URL'
                value={paddleForm.image}
                onChange={e =>
                  setPaddleForm({ ...paddleForm, image: e.target.value })
                }
                borderRadius="none"
                borderWidth="2px"
                borderColor={borderColor}
                _focus={{
                  borderColor: primaryColor,
                  borderWidth: "3px",
                }}
                _hover={{
                  borderColor: primaryColor,
                }}
              />
              <Input
                placeholder='Price Link (e.g., Amazon, manufacturer website)'
                value={paddleForm.priceLink}
                onChange={e =>
                  setPaddleForm({ ...paddleForm, priceLink: e.target.value })
                }
                borderRadius="none"
                borderWidth="2px"
                borderColor={borderColor}
                _focus={{
                  borderColor: primaryColor,
                  borderWidth: "3px",
                }}
                _hover={{
                  borderColor: primaryColor,
                }}
              />
              <Textarea
                placeholder='Description'
                value={paddleForm.description}
                onChange={e =>
                  setPaddleForm({ ...paddleForm, description: e.target.value })
                }
                rows={3}
                borderRadius="none"
                borderWidth="2px"
                borderColor={borderColor}
                _focus={{
                  borderColor: primaryColor,
                  borderWidth: "3px",
                }}
                _hover={{
                  borderColor: primaryColor,
                }}
              />
              <HStack spacing={4} w='full' pt={2}>
                <Button
                  bg={primaryColor}
                  color="white"
                  onClick={handleSubmit}
                  flex={1}
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={primaryColor}
                  fontWeight="700"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  _hover={{
                    bg: primaryDark,
                  }}
                >
                  {isEditing ? 'Update' : 'Create'} Paddle
                </Button>
                <Button
                  onClick={handleClose}
                  flex={1}
                  variant="outline"
                  borderRadius="none"
                  borderWidth="2px"
                  borderColor={textPrimary}
                  color={textPrimary}
                  fontWeight="700"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  _hover={{
                    bg: textPrimary,
                    color: "white",
                  }}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation - Editorial Style */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={bgColor} borderRadius="none">
            <AlertDialogHeader
              fontSize='lg'
              fontWeight='900'
              color={textPrimary}
              borderBottomWidth="2px"
              borderColor={primaryColor}
              py={4}
            >
              Delete Paddle
            </AlertDialogHeader>
            <AlertDialogBody py={6}>
              <Text color={textSecondary} lineHeight="1.7">
                Are you sure you want to delete "{selectedPaddle?.name}"? This
                action cannot be undone.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
              <Button
                ref={cancelRef}
                onClick={() => setIsDeleteOpen(false)}
                variant="outline"
                borderRadius="none"
                borderWidth="2px"
                borderColor={textPrimary}
                color={textPrimary}
                fontWeight="700"
                letterSpacing="0.05em"
                textTransform="uppercase"
                _hover={{
                  bg: textPrimary,
                  color: "white",
                }}
              >
                Cancel
              </Button>
              <Button
                bg={textPrimary}
                color="white"
                onClick={handleDelete}
                ml={3}
                borderRadius="none"
                borderWidth="2px"
                borderColor={textPrimary}
                fontWeight="700"
                letterSpacing="0.05em"
                textTransform="uppercase"
                _hover={{
                  bg: textSecondary,
                }}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PaddleManagementPage;
