import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { usePaddleStore } from '../store/paddle';
import { usePlayerStore } from '../store/player';
import { SearchIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionHStack = motion(HStack);

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
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

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
    sessionStorage.setItem('paddleListScrollPosition', window.pageYOffset.toString());
    sessionStorage.setItem('restorePaddleListScroll', 'true');
    navigate(`/paddle/${paddle._id}`);
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePaddleMouseDown = (e, paddle) => {
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
    <Box
      sx={{
        '--font-display': '"Merriweather", serif',
        '--font-body': '"Inter", sans-serif',
        '--color-primary': '#2C5F7C',
        '--color-secondary': '#D4A574',
        '--color-accent': '#8B9DC3',
        '--color-bg': '#FAF9F6',
        '--color-text-primary': '#1A1A1A',
        '--color-text-secondary': '#6B6B6B',
        fontFamily: 'var(--font-body)',
      }}
      bg="var(--color-bg)"
      minH="100vh"
      position="relative"
    >
      {/* Subtle background gradient */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        zIndex={0}
        sx={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(44, 95, 124, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(212, 165, 116, 0.06) 0%, transparent 50%)
          `,
        }}
      />

      <Container maxW='container.xl' py={{ base: 12, md: 16 }} position="relative" zIndex={1}>
        <VStack spacing={{ base: 10, md: 12 }}>
          {/* Simple Header */}
          <MotionVStack
            ref={headerRef}
            spacing={6}
            w="full"
            align="center"
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <MotionHeading
              as="h1"
              fontSize={{ base: '3.5rem', md: '5rem', lg: '6rem' }}
              fontFamily="var(--font-display)"
              fontWeight={700}
              letterSpacing="-0.02em"
              textAlign="center"
              color="var(--color-text-primary)"
            >
              Paddles
            </MotionHeading>
          </MotionVStack>

          {/* Search and Add Button */}
          <MotionVStack 
            w='full' 
            spacing={{ base: 4, md: 5 }}
            maxW="800px"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <HStack w='full' spacing={4} align="center">
              <Box flex={1}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents='none' h="100%">
                    <SearchIcon color="var(--color-text-secondary)" />
                  </InputLeftElement>
                  <Input
                    placeholder='Search paddles by name, brand, or model...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    bg='white'
                    color="var(--color-text-primary)"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    borderRadius="full"
                    fontSize="md"
                    fontFamily="var(--font-body)"
                    fontWeight={400}
                    h="56px"
                    _placeholder={{
                      color: "var(--color-text-secondary)",
                      opacity: 0.5,
                    }}
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                      outline: "none",
                    }}
                    _hover={{
                      borderColor: "var(--color-accent)",
                    }}
                    transition="all 0.3s ease"
                  />
                </InputGroup>
              </Box>

              <HStack spacing={4} align="center">
                {getRoleFromToken() === 'admin' && (
                  <Button
                    leftIcon={<AddIcon />}
                    size="lg"
                    h="56px"
                    px={6}
                    bg="var(--color-primary)"
                    color="white"
                    border="none"
                    borderRadius="full"
                    fontFamily="var(--font-body)"
                    fontWeight={600}
                    fontSize="md"
                    _hover={{
                      bg: "var(--color-accent)",
                    }}
                    transition="all 0.3s ease"
                    onClick={handleAddNew}
                    as={motion.button}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Paddle
                  </Button>
                )}

                <MotionText
                  fontSize={{ base: 'md', md: 'lg' }}
                  color="var(--color-text-secondary)"
                  fontFamily="var(--font-body)"
                  fontWeight={400}
                  whiteSpace="nowrap"
                  initial={{ opacity: 0 }}
                  animate={headerInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {filteredPaddles.length} {filteredPaddles.length === 1 ? 'paddle' : 'paddles'}
                </MotionText>
              </HStack>
            </HStack>
          </MotionVStack>

          {/* Paddles Grid */}
          <MotionBox
            w="full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {isLoading ? (
              <Center py={16}>
                <Spinner size='xl' color="var(--color-primary)" thickness="4px" />
              </Center>
            ) : filteredPaddles.length === 0 ? (
              <Box
                textAlign="center"
                py={16}
                bg="white"
                borderRadius="0"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.08)"
                px={8}
              >
                <MotionText
                  fontSize={{ base: 'xl', md: '2xl' }}
                  fontFamily="var(--font-display)"
                  fontWeight={600}
                  color="var(--color-text-primary)"
                  mb={4}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {searchQuery
                    ? 'No paddles found matching your search'
                    : 'No paddles found'}
                </MotionText>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 8, md: 10 }} w='full'>
                {filteredPaddles.map((paddle, index) => {
                  // Create a PaddleCard component inline with hover state
                  const PaddleCard = () => {
                    const [fontSize, setFontSize] = useState({ base: '2xl', md: '3xl' });
                    const [isHovered, setIsHovered] = useState(false);
                    const badgeControls = useAnimation();
                    const nameRef = useRef(null);

                    // Check if name overflows and adjust font size
                    useEffect(() => {
                      const checkOverflow = () => {
                        if (nameRef.current) {
                          setFontSize({ base: '2xl', md: '3xl' });
                          requestAnimationFrame(() => {
                            setTimeout(() => {
                              if (nameRef.current) {
                                const element = nameRef.current;
                                if (element.scrollWidth > element.clientWidth) {
                                  setFontSize({ base: 'xl', md: '2xl' });
                                  requestAnimationFrame(() => {
                                    setTimeout(() => {
                                      if (nameRef.current && nameRef.current.scrollWidth > nameRef.current.clientWidth) {
                                        setFontSize({ base: 'lg', md: 'xl' });
                                      }
                                    }, 50);
                                  });
                                }
                              }
                            }, 100);
                          });
                        }
                      };
                      checkOverflow();
                      window.addEventListener('resize', checkOverflow);
                      return () => window.removeEventListener('resize', checkOverflow);
                    }, [paddle.name]);

                    // Initialize badges as hidden
                    useEffect(() => {
                      badgeControls.set({
                        opacity: 0,
                        y: 10,
                        scale: 0.95,
                      });
                    }, [badgeControls]);

                    const handleMouseEnter = () => {
                      setIsHovered(true);
                      badgeControls.start({
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
                      });
                    };

                    const handleMouseLeave = () => {
                      setIsHovered(false);
                      badgeControls.start({
                        opacity: 0,
                        y: 10,
                        scale: 0.95,
                        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                      });
                    };

                    return (
                      <MotionBox
                        w='full'
                        maxW='400px'
                        bg="var(--color-bg)"
                        borderRadius='0'
                        overflow='hidden'
                        position='relative'
                        cursor='pointer'
                        onClick={() => handlePaddleClick(paddle)}
                        onMouseDown={(e) => handlePaddleMouseDown(e, paddle)}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ 
                          y: -6,
                          transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
                        }}
                        sx={{
                          '--font-display': '"Merriweather", serif',
                          '--font-body': '"Inter", sans-serif',
                          '--color-primary': '#2C5F7C',
                          '--color-secondary': '#D4A574',
                          '--color-accent': '#8B9DC3',
                          '--color-bg': '#FAF9F6',
                          '--color-text-primary': '#1A1A1A',
                          '--color-text-secondary': '#6B6B6B',
                          fontFamily: 'var(--font-body)',
                          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                        }}
                        _hover={{
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                        }}
                      >
                        {/* Image section */}
                        <Box
                          position="relative"
                          h={{ base: '180px', md: '200px' }}
                          bg="white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          p={4}
                        >
                          <Image
                            src={paddle.image || '/unknownPaddle.png'}
                            alt={paddle.name}
                            borderRadius="0"
                            w="full"
                            h="full"
                            objectFit="contain"
                            loading="lazy"
                          />
                        </Box>

                        {/* Content section */}
                        <Box p={{ base: 6, md: 8 }} bg="var(--color-bg)">
                          <VStack spacing={3} align='start'>
                            {/* Name */}
                            <MotionHeading
                              ref={nameRef}
                              as="h3"
                              fontSize={fontSize}
                              fontFamily='"Merriweather", serif'
                              fontWeight={700}
                              color="var(--color-text-primary)"
                              letterSpacing="-0.01em"
                              lineHeight="1.2"
                              textAlign="center"
                              w="full"
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              {paddle.name}
                            </MotionHeading>

                            {/* Equipment badges - oval shaped - expandable container */}
                            <MotionBox
                              w="full"
                              overflow="hidden"
                              initial={{ maxHeight: 0, opacity: 0 }}
                              animate={isHovered ? { maxHeight: 200, opacity: 1 } : { maxHeight: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <VStack spacing={3} align='start' w='full' pt={2}>
                                {/* Brand and Shape badges - wrap if needed */}
                                <MotionBox
                                  w="full"
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={badgeControls}
                                  display="flex"
                                  flexWrap="wrap"
                                  gap={2}
                                  justifyContent="space-between"
                                >
                                  {/* Brand badge */}
                                  {paddle.brand && (
                                    <Badge 
                                      borderRadius="full"
                                      px={3}
                                      py={1}
                                      fontSize={{ base: 'xs', md: 'sm' }}
                                      fontFamily="var(--font-body)"
                                      bg="var(--color-primary)"
                                      color="white"
                                      fontWeight={600}
                                      as={motion.div}
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.2 }}
                                      flexShrink={0}
                                    >
                                      {paddle.brand}
                                    </Badge>
                                  )}

                                  {/* Shape badge */}
                                  {paddle.shape && (
                                    <Badge 
                                      borderRadius="full"
                                      px={3}
                                      py={1}
                                      fontSize={{ base: 'xs', md: 'sm' }}
                                      fontFamily="var(--font-body)"
                                      bg="var(--color-secondary)"
                                      color="white"
                                      fontWeight={600}
                                      as={motion.div}
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.2 }}
                                      flexShrink={0}
                                    >
                                      {paddle.shape}
                                    </Badge>
                                  )}
                                </MotionBox>

                                {/* Thickness badge below if exists */}
                                {paddle.thickness && (
                                  <MotionBox
                                    w="full"
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={badgeControls}
                                  >
                                    <Badge 
                                      borderRadius="full"
                                      px={3}
                                      py={1}
                                      fontSize={{ base: 'xs', md: 'sm' }}
                                      fontFamily="var(--font-body)"
                                      bg="var(--color-accent)"
                                      color="white"
                                      fontWeight={600}
                                      as={motion.div}
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {paddle.thickness}
                                    </Badge>
                                  </MotionBox>
                                )}
                              </VStack>
                            </MotionBox>

                            {/* Admin buttons */}
                            {getRoleFromToken() === 'admin' && (
                              <MotionHStack 
                                spacing={3} 
                                w='full'
                                pt={4}
                                borderTop="1px solid"
                                borderColor="rgba(0, 0, 0, 0.08)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <Button
                                  size="sm"
                                  onClick={(e) => handleButtonClick(e, 'edit', paddle)}
                                  flex={1}
                                  bg="var(--color-primary)"
                                  color="white"
                                  border="none"
                                  borderRadius="full"
                                  fontFamily="var(--font-body)"
                                  fontWeight={600}
                                  fontSize="sm"
                                  h="36px"
                                  _hover={{
                                    bg: "var(--color-accent)",
                                  }}
                                  transition="all 0.3s ease"
                                  as={motion.button}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => handleButtonClick(e, 'delete', paddle)}
                                  flex={1}
                                  bg="transparent"
                                  color="var(--color-text-primary)"
                                  border="1px solid"
                                  borderColor="rgba(0, 0, 0, 0.15)"
                                  borderRadius="full"
                                  fontFamily="var(--font-body)"
                                  fontWeight={600}
                                  fontSize="sm"
                                  h="36px"
                                  _hover={{
                                    bg: "rgba(220, 38, 38, 0.08)",
                                    borderColor: "rgba(220, 38, 38, 0.4)",
                                    color: "rgba(220, 38, 38, 1)",
                                  }}
                                  transition="all 0.3s ease"
                                  as={motion.button}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  Delete
                                </Button>
                              </MotionHStack>
                            )}
                          </VStack>
                        </Box>
                      </MotionBox>
                    );
                  };

                  return (
                    <MotionBox
                      key={paddle._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <PaddleCard />
                    </MotionBox>
                  );
                })}
              </SimpleGrid>
            )}
          </MotionBox>
        </VStack>
      </Container>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
        <ModalOverlay />
        <ModalContent
          sx={{
            fontFamily: 'var(--font-body)',
          }}
          borderRadius="0"
        >
          <ModalHeader
            fontFamily="var(--font-display)"
            fontSize="2xl"
            fontWeight={600}
            color="var(--color-text-primary)"
            borderBottom="1px solid"
            borderColor="rgba(0, 0, 0, 0.1)"
          >
            {isEditing ? 'Edit Paddle' : 'Add New Paddle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={8}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel
                  fontFamily="var(--font-body)"
                  fontWeight={500}
                  color="var(--color-text-primary)"
                  fontSize="sm"
                >
                  Paddle Name
                </FormLabel>
                <Input
                  placeholder='Enter paddle name'
                  value={paddleForm.name}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, name: e.target.value })
                  }
                  borderRadius="0"
                  border="1px solid"
                  borderColor="rgba(0, 0, 0, 0.1)"
                  _focus={{
                    borderColor: "var(--color-primary)",
                    boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                  }}
                />
              </FormControl>

              <HStack spacing={4} w='full'>
                <FormControl>
                  <FormLabel
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    color="var(--color-text-primary)"
                    fontSize="sm"
                  >
                    Brand
                  </FormLabel>
                  <Input
                    placeholder='Enter brand'
                    value={paddleForm.brand}
                    onChange={e =>
                      setPaddleForm({ ...paddleForm, brand: e.target.value })
                    }
                    borderRadius="0"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    color="var(--color-text-primary)"
                    fontSize="sm"
                  >
                    Model
                  </FormLabel>
                  <Input
                    placeholder='Enter model'
                    value={paddleForm.model}
                    onChange={e =>
                      setPaddleForm({ ...paddleForm, model: e.target.value })
                    }
                    borderRadius="0"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w='full'>
                <FormControl>
                  <FormLabel
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    color="var(--color-text-primary)"
                    fontSize="sm"
                  >
                    Shape
                  </FormLabel>
                  <Input
                    placeholder='Enter shape'
                    value={paddleForm.shape}
                    onChange={e =>
                      setPaddleForm({ ...paddleForm, shape: e.target.value })
                    }
                    borderRadius="0"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    color="var(--color-text-primary)"
                    fontSize="sm"
                  >
                    Thickness
                  </FormLabel>
                  <Input
                    placeholder='Enter thickness'
                    value={paddleForm.thickness}
                    onChange={e =>
                      setPaddleForm({ ...paddleForm, thickness: e.target.value })
                    }
                    borderRadius="0"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w='full'>
                <FormControl>
                  <FormLabel
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    color="var(--color-text-primary)"
                    fontSize="sm"
                  >
                    Handle Length
                  </FormLabel>
                  <Input
                    placeholder='Enter handle length'
                    value={paddleForm.handleLength}
                    onChange={e =>
                      setPaddleForm({
                        ...paddleForm,
                        handleLength: e.target.value,
                      })
                    }
                    borderRadius="0"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    color="var(--color-text-primary)"
                    fontSize="sm"
                  >
                    Paddle Length
                  </FormLabel>
                  <Input
                    placeholder='Enter paddle length'
                    value={paddleForm.length}
                    onChange={e =>
                      setPaddleForm({ ...paddleForm, length: e.target.value })
                    }
                    borderRadius="0"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w='full'>
                <FormControl>
                  <FormLabel
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    color="var(--color-text-primary)"
                    fontSize="sm"
                  >
                    Paddle Width
                  </FormLabel>
                  <Input
                    placeholder='Enter paddle width'
                    value={paddleForm.width}
                    onChange={e =>
                      setPaddleForm({ ...paddleForm, width: e.target.value })
                    }
                    borderRadius="0"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    color="var(--color-text-primary)"
                    fontSize="sm"
                  >
                    Core
                  </FormLabel>
                  <Input
                    placeholder='Enter core'
                    value={paddleForm.core}
                    onChange={e =>
                      setPaddleForm({ ...paddleForm, core: e.target.value })
                    }
                    borderRadius="0"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel
                  fontFamily="var(--font-body)"
                  fontWeight={500}
                  color="var(--color-text-primary)"
                  fontSize="sm"
                >
                  Image URL
                </FormLabel>
                <Input
                  placeholder='Enter image URL'
                  value={paddleForm.image}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, image: e.target.value })
                  }
                  borderRadius="0"
                  border="1px solid"
                  borderColor="rgba(0, 0, 0, 0.1)"
                  _focus={{
                    borderColor: "var(--color-primary)",
                    boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  fontFamily="var(--font-body)"
                  fontWeight={500}
                  color="var(--color-text-primary)"
                  fontSize="sm"
                >
                  Price Link
                </FormLabel>
                <Input
                  placeholder='Enter price link (e.g., Amazon, manufacturer website)'
                  value={paddleForm.priceLink}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, priceLink: e.target.value })
                  }
                  borderRadius="0"
                  border="1px solid"
                  borderColor="rgba(0, 0, 0, 0.1)"
                  _focus={{
                    borderColor: "var(--color-primary)",
                    boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  fontFamily="var(--font-body)"
                  fontWeight={500}
                  color="var(--color-text-primary)"
                  fontSize="sm"
                >
                  Description
                </FormLabel>
                <Textarea
                  placeholder='Enter description'
                  value={paddleForm.description}
                  onChange={e =>
                    setPaddleForm({ ...paddleForm, description: e.target.value })
                  }
                  rows={3}
                  borderRadius="0"
                  border="1px solid"
                  borderColor="rgba(0, 0, 0, 0.1)"
                  _focus={{
                    borderColor: "var(--color-primary)",
                    boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                  }}
                />
              </FormControl>

              <HStack spacing={4} w='full' pt={4}>
                <Button
                  onClick={handleSubmit}
                  flex={1}
                  bg="var(--color-primary)"
                  color="white"
                  border="none"
                  borderRadius="full"
                  fontFamily="var(--font-body)"
                  fontWeight={600}
                  h="48px"
                  fontSize="md"
                  _hover={{
                    bg: "var(--color-accent)",
                  }}
                  transition="all 0.3s ease"
                  as={motion.button}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isEditing ? 'Update' : 'Create'} Paddle
                </Button>
                <Button
                  onClick={handleClose}
                  flex={1}
                  border="1px solid"
                  borderColor="var(--color-primary)"
                  borderRadius="full"
                  color="var(--color-primary)"
                  fontFamily="var(--font-body)"
                  fontWeight={600}
                  h="48px"
                  fontSize="md"
                  _hover={{
                    bg: "var(--color-primary)",
                    color: "white",
                  }}
                  transition="all 0.3s ease"
                  as={motion.button}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
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
          <AlertDialogContent
            sx={{
              fontFamily: 'var(--font-body)',
            }}
            borderRadius="0"
          >
            <AlertDialogHeader
              fontSize='xl'
              fontWeight={600}
              fontFamily="var(--font-display)"
              color="var(--color-text-primary)"
            >
              Delete Paddle
            </AlertDialogHeader>
            <AlertDialogBody
              fontFamily="var(--font-body)"
              color="var(--color-text-secondary)"
            >
              Are you sure you want to delete "{selectedPaddle?.name}"? This action cannot
              be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsDeleteOpen(false)}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.2)"
                fontFamily="var(--font-body)"
                fontWeight={500}
                _hover={{
                  bg: "rgba(0, 0, 0, 0.05)",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                ml={3}
                bg="rgba(220, 38, 38, 1)"
                color="white"
                borderRadius="full"
                fontFamily="var(--font-body)"
                fontWeight={500}
                _hover={{
                  bg: "rgba(220, 38, 38, 0.9)",
                }}
                transition="all 0.3s ease"
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
