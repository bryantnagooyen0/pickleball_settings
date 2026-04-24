import React, { useEffect, useState } from 'react';
import {
  Box, Container, VStack, HStack, Text, Heading, Button, Badge,
  Spinner, Center, Image, SimpleGrid, Divider, useToast, AlertDialog,
  AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent,
  AlertDialogOverlay, useDisclosure,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { useSetupStore } from '../store/setup';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import SetupCanvas from '../components/SetupCanvas';
import CommentSection from '../components/CommentSection';

const SetupDetailPage = () => {
  const { setupId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const { toggleLike, deleteSetup } = useSetupStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const [setup, setSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await api.get(`/api/setups/${setupId}`);
        setSetup(data.data);
        setLikesCount(data.data.likesCount || 0);
        if (user) {
          setLiked(data.data.likes?.some(id => id === user.id || id?._id === user.id));
        }
      } catch {
        toast({ title: 'Setup not found', status: 'error' });
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setupId, user]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Please log in to like setups', status: 'warning' });
      return;
    }
    setLiking(true);
    const result = await toggleLike(setupId);
    if (result.success) {
      setLiked(result.data.liked);
      setLikesCount(result.data.likesCount);
    }
    setLiking(false);
  };

  const handleDelete = async () => {
    const result = await deleteSetup(setupId);
    if (result.success) {
      toast({ title: 'Setup deleted', status: 'success' });
      navigate('/community');
    } else {
      toast({ title: result.message || 'Failed to delete', status: 'error' });
    }
    onClose();
  };

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="orange.400" />
      </Center>
    );
  }

  if (!setup) return null;

  const isAuthor = user && setup.author === user.id;

  return (
    <Container maxW="900px" py={8}>
      <VStack spacing={6} align="stretch">

        {/* Back */}
        <Button variant="ghost" color="gray.400" alignSelf="flex-start"
          onClick={() => navigate(`/community/paddle/${setup.paddle?._id}`)}>
          ← Back to {setup.paddle?.name} Setups
        </Button>

        {/* Header */}
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg" color="white">{setup.paddle?.name}</Heading>
            <Text color="gray.400">Setup by @{setup.authorName}</Text>
          </Box>
          {isAuthor && (
            <HStack>
              <Button size="sm" colorScheme="red" variant="outline" onClick={onOpen}>Delete</Button>
            </HStack>
          )}
        </HStack>

        {/* Main content: canvas + photo */}
        <SimpleGrid columns={{ base: 1, md: setup.photoUrl ? 2 : 1 }} spacing={6}>
          <Box>
            <Text color="gray.400" fontSize="sm" mb={2} fontWeight="bold">Lead Tape Placement</Text>
            <Center bg="gray.800" borderRadius="lg" p={4}>
              <SetupCanvas strips={setup.leadTapeStrips || []} readOnly width={220} paddleShape={setup.paddle?.shape} />
            </Center>
          </Box>
          {setup.photoUrl && (
            <Box>
              <Text color="gray.400" fontSize="sm" mb={2} fontWeight="bold">Setup Photo</Text>
              <Image
                src={setup.photoUrl} alt="Setup photo"
                borderRadius="lg" maxH="360px" objectFit="cover" w="100%"
              />
            </Box>
          )}
        </SimpleGrid>

        {/* Mod Details */}
        <Box bg="gray.800" borderRadius="lg" p={5}>
          <Text color="white" fontWeight="bold" mb={4}>Setup Details</Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <Box>
              <Text color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Lead Tape</Text>
              <Text color="white" fontSize="sm">
                {setup.leadTapeTotalGrams > 0
                  ? `${setup.leadTapeTotalGrams}g total (${setup.leadTapeStrips?.length} strip${setup.leadTapeStrips?.length !== 1 ? 's' : ''})`
                  : 'None'}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Total Weight</Text>
              <Text color="white" fontSize="sm">{setup.totalWeightGrams > 0 ? `${setup.totalWeightGrams}g` : '—'}</Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Overgrip</Text>
              <Text color="white" fontSize="sm">{setup.overgrip?.brand || '—'}</Text>
              {setup.overgrip?.notes && <Text color="gray.400" fontSize="xs">{setup.overgrip.notes}</Text>}
            </Box>
            <Box>
              <Text color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Edge Guard</Text>
              <Text color="white" fontSize="sm">{setup.edgeGuard?.brand || '—'}</Text>
              {setup.edgeGuard?.notes && <Text color="gray.400" fontSize="xs">{setup.edgeGuard.notes}</Text>}
            </Box>
          </SimpleGrid>
          {setup.notes && (
            <Box mt={4}>
              <Text color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Notes</Text>
              <Text color="white" fontSize="sm" mt={1}>{setup.notes}</Text>
            </Box>
          )}
        </Box>

        {/* Like button */}
        <HStack>
          <Button
            colorScheme={liked ? 'red' : 'gray'}
            variant={liked ? 'solid' : 'outline'}
            onClick={handleLike}
            isLoading={liking}
            leftIcon={<Text>❤️</Text>}
          >
            {liked ? 'Liked' : 'Like'} · {likesCount}
          </Button>
        </HStack>

        <Divider borderColor="gray.700" />

        {/* Comments */}
        <CommentSection targetType="setup" targetId={setupId} />

      </VStack>

      {/* Delete confirmation */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogContent bg="gray.800">
          <AlertDialogHeader color="white">Delete Setup</AlertDialogHeader>
          <AlertDialogBody color="gray.300">Are you sure? This cannot be undone.</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDelete} ml={3}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default SetupDetailPage;
