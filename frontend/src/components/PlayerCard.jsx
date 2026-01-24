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
  Heading,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { motion, useAnimation } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);
const MotionHeading = motion(Heading);

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
  const [fontSize, setFontSize] = useState({ base: '2xl', md: '3xl' });
  const cancelRef = useRef();
  const nameRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const openInNewTab = url => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
      Object.assign(player, updatedPlayer.data);
      setEditPlayer({ ...editPlayer, ...updatedPlayer.data });
      window.location.reload();
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
      if (onPlayerDeleted) {
        onPlayerDeleted();
      } else {
        window.location.reload();
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
    if (location.pathname === '/players') {
      sessionStorage.setItem('playerListScrollPosition', window.pageYOffset.toString());
      sessionStorage.setItem('restorePlayerListScroll', 'true');
    }
    navigate(`/player/${player._id}`);
  };

  const handleCardMouseDown = e => {
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      openInNewTab(`/player/${player._id}`);
    }
  };

  const handleButtonClick = (e, action) => {
    e.stopPropagation();
    if (action === 'edit') {
      onOpen();
    } else if (action === 'delete') {
      setIsDeleteOpen(true);
    }
  };

  // Check if name overflows and adjust font size - optimized version
  useEffect(() => {
    if (!nameRef.current) return;
    
    const checkOverflow = () => {
      const element = nameRef.current;
      if (!element) return;
      
      // Use a single RAF for better performance
      requestAnimationFrame(() => {
        if (!element) return;
        
        // Reset to original size first
        setFontSize({ base: '2xl', md: '3xl' });
        
        // Check overflow after a brief delay to allow render
        const timeoutId = setTimeout(() => {
          if (!element) return;
          
          // Check if scrollWidth (content width) > clientWidth (visible width)
          if (element.scrollWidth > element.clientWidth) {
            setFontSize({ base: 'xl', md: '2xl' });
            
            // Final check with smaller size
            setTimeout(() => {
              if (element && element.scrollWidth > element.clientWidth) {
                setFontSize({ base: 'lg', md: 'xl' });
              }
            }, 30);
          }
        }, 50);
        
        return () => clearTimeout(timeoutId);
      });
    };

    // Debounce resize events
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkOverflow, 150);
    };

    checkOverflow();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [player.name]);

  // Animation controls for badges
  const badgeControls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

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
    <>
      <MotionBox
        w='full'
        maxW='400px'
        bg="var(--color-bg)"
        borderRadius='0'
        overflow='hidden'
        position='relative'
        cursor='pointer'
        onClick={handleCardClick}
        onMouseDown={handleCardMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
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
          bg="var(--color-bg)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src={player.image}
            alt={player.name}
            borderRadius='full'
            width={{ base: '160px', md: '180px' }}
            height={{ base: '160px', md: '180px' }}
            objectFit='cover'
            border='4px solid white'
            boxShadow='0 4px 16px rgba(0, 0, 0, 0.1)'
            loading='lazy'
            sx={{
              imageRendering: 'auto',
              imageRendering: '-webkit-optimize-contrast',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
            }}
            fallback={
              <Box
                width={{ base: '160px', md: '180px' }}
                height={{ base: '160px', md: '180px' }}
                borderRadius='full'
                bg='linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)'
                display='flex'
                alignItems='center'
                justifyContent='center'
                border='4px solid white'
                boxShadow='0 4px 16px rgba(0, 0, 0, 0.1)'
              >
                <Text 
                  fontSize='4xl' 
                  color='white'
                  fontFamily="var(--font-display)"
                  fontWeight={700}
                >
                  {player.name.charAt(0)}
                </Text>
              </Box>
            }
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
              {player.name}
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
              {/* Sponsor (left) and Paddle (right) inline */}
              <MotionHStack
                w="full"
                spacing={3}
                justify="space-between"
                align="center"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={badgeControls}
              >
                {/* Sponsor badge on the left */}
                {player.sponsor ? (
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
                  >
                    {player.sponsor}
                  </Badge>
                ) : (
                  <Box flex={1} />
                )}

                {/* Paddle badge on the right */}
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
                  ml="auto"
                >
                  {player.paddle}
                </Badge>
              </MotionHStack>

              {/* Shoes badge below if exists */}
              {player.shoes && (
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
                    {player.shoes}
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
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="sm"
                  onClick={e => handleButtonClick(e, 'edit')}
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
                  onClick={e => handleButtonClick(e, 'delete')}
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

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
            Edit Player
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} pb={4}>
              <FormControl>
                <FormLabel
                  fontFamily="var(--font-body)"
                  fontWeight={500}
                  color="var(--color-text-primary)"
                  fontSize="sm"
                >
                  Player Name
                </FormLabel>
                <Input
                  placeholder='Enter player name'
                  value={editPlayer.name}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, name: e.target.value })
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
                  Paddle
                </FormLabel>
                <Input
                  placeholder='Enter paddle model'
                  value={editPlayer.paddle}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, paddle: e.target.value })
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
                  Paddle Shape
                </FormLabel>
                <Input
                  placeholder='Enter paddle shape (optional)'
                  value={editPlayer.paddleShape}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, paddleShape: e.target.value })
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
                  Paddle Thickness
                </FormLabel>
                <Input
                  placeholder='Enter paddle thickness (optional)'
                  value={editPlayer.paddleThickness}
                  onChange={e =>
                    setEditPlayer({
                      ...editPlayer,
                      paddleThickness: e.target.value,
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
                  Paddle Handle Length
                </FormLabel>
                <Input
                  placeholder='Enter handle length (optional)'
                  value={editPlayer.paddleHandleLength}
                  onChange={e =>
                    setEditPlayer({
                      ...editPlayer,
                      paddleHandleLength: e.target.value,
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
                  Paddle Color
                </FormLabel>
                <Input
                  placeholder='Enter paddle color (optional)'
                  value={editPlayer.paddleColor}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, paddleColor: e.target.value })
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
                  Paddle Image URL
                </FormLabel>
                <Input
                  placeholder='Enter paddle image URL (optional)'
                  value={editPlayer.paddleImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, paddleImage: e.target.value })
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
                  Player Image URL
                </FormLabel>
                <Input
                  placeholder='Enter player image URL'
                  value={editPlayer.image}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, image: e.target.value })
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
                  Age
                </FormLabel>
                <Input
                  placeholder='Enter age (optional)'
                  type='number'
                  value={editPlayer.age}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, age: e.target.value })
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
                  Height
                </FormLabel>
                <Input
                  placeholder='Enter height (optional)'
                  value={editPlayer.height}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, height: e.target.value })
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
                  MLP Team
                </FormLabel>
                <Input
                  placeholder='Enter MLP team (optional)'
                  value={editPlayer.mlpTeam}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, mlpTeam: e.target.value })
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
                  Current Location
                </FormLabel>
                <Input
                  placeholder='Enter current location (optional)'
                  value={editPlayer.currentLocation}
                  onChange={e =>
                    setEditPlayer({
                      ...editPlayer,
                      currentLocation: e.target.value,
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
                  About
                </FormLabel>
                <Textarea
                  placeholder='Enter player description (optional)'
                  value={editPlayer.about}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, about: e.target.value })
                  }
                  rows={4}
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
                  Shoe Image URL
                </FormLabel>
                <Input
                  placeholder='Enter shoe image URL (optional)'
                  value={editPlayer.shoeImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, shoeImage: e.target.value })
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
                  Shoe Model
                </FormLabel>
                <Input
                  placeholder='Enter shoe model (optional)'
                  value={editPlayer.shoeModel}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, shoeModel: e.target.value })
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
                  Overgrips
                </FormLabel>
                <Input
                  placeholder='Enter overgrips (optional)'
                  value={editPlayer.overgrips}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, overgrips: e.target.value })
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
                  Overgrip Image URL
                </FormLabel>
                <Input
                  placeholder='Enter overgrip image URL (optional)'
                  value={editPlayer.overgripImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, overgripImage: e.target.value })
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
                  Sponsor
                </FormLabel>
                <Input
                  placeholder='Enter sponsor (optional)'
                  value={editPlayer.sponsor}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, sponsor: e.target.value })
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
                  Weight
                </FormLabel>
                <Input
                  placeholder='Enter weight (optional)'
                  value={editPlayer.weight}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, weight: e.target.value })
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
                  Weight Image URL
                </FormLabel>
                <Input
                  placeholder='Enter weight image URL (optional)'
                  value={editPlayer.weightImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, weightImage: e.target.value })
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
                  Total Weight
                </FormLabel>
                <Input
                  placeholder='Enter total weight (optional)'
                  value={editPlayer.totalWeight}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, totalWeight: e.target.value })
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
                  Weight Location
                </FormLabel>
                <Input
                  placeholder='Enter weight location (optional)'
                  value={editPlayer.weightLocation}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, weightLocation: e.target.value })
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
                  Tape Details
                </FormLabel>
                <Input
                  placeholder='Enter tape details (optional)'
                  value={editPlayer.tapeDetails}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, tapeDetails: e.target.value })
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
                  Additional Modification
                </FormLabel>
                <Input
                  placeholder='Enter additional modification (optional)'
                  value={editPlayer.additionalModification}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, additionalModification: e.target.value })
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
                  Additional Modification Image URL
                </FormLabel>
                <Input
                  placeholder='Enter additional modification image URL (optional)'
                  value={editPlayer.additionalModificationImage}
                  onChange={e =>
                    setEditPlayer({ ...editPlayer, additionalModificationImage: e.target.value })
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
              
              <Button 
                onClick={handleUpdate} 
                w='full'
                bg="var(--color-primary)"
                color="white"
                border="none"
                borderRadius="full"
                fontFamily="var(--font-body)"
                fontWeight={600}
                h="48px"
                _hover={{
                  bg: "var(--color-accent)",
                }}
                transition="all 0.3s ease"
                as={motion.button}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
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
              Delete Player
            </AlertDialogHeader>

            <AlertDialogBody
              fontFamily="var(--font-body)"
              color="var(--color-text-secondary)"
            >
              Are you sure you want to delete <strong>{player.name}</strong>? This action cannot
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
                isLoading={isDeleting}
                loadingText='Deleting...'
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
    </>
  );
};

export default memo(PlayerCard);
