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
      <Box
        minH="100vh"
        sx={{
          background: 'radial-gradient(circle at 20% 50%, rgba(44,95,124,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212,165,116,0.03) 0%, transparent 50%), var(--color-bg)',
          '--color-bg': '#FAF9F6',
        }}
      >
        <Center minH="60vh">
          <Spinner size="xl" color="#2C5F7C" />
        </Center>
      </Box>
    );
  }

  if (!setup) return null;

  const isAuthor = user && setup.author === user.id;

  return (
    <Box
      minH="100vh"
      sx={{
        background: 'radial-gradient(circle at 20% 50%, rgba(44,95,124,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212,165,116,0.03) 0%, transparent 50%), var(--color-bg)',
        '--color-primary': '#2C5F7C',
        '--color-secondary': '#D4A574',
        '--color-accent': '#8B9DC3',
        '--color-bg': '#FAF9F6',
        '--color-text-primary': '#1A1A1A',
        '--color-text-secondary': '#666666',
        '--font-display': '"Merriweather", serif',
        '--font-body': '"Inter", sans-serif',
      }}
    >
      <Container maxW="900px" py={{ base: 8, md: 12 }}>
        <VStack spacing={6} align="stretch">

          {/* Back */}
          <Button
            variant="ghost"
            color="var(--color-primary)"
            alignSelf="flex-start"
            fontFamily="var(--font-body)"
            fontWeight={600}
            _hover={{ bg: 'rgba(44,95,124,0.06)' }}
            onClick={() => navigate(`/community/paddle/${setup.paddle?._id}`)}
          >
            ← Back to {setup.paddle?.name} Setups
          </Button>

          {/* Header */}
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Box>
              <Heading
                size="lg"
                fontFamily="var(--font-display)"
                color="var(--color-text-primary)"
                letterSpacing="-0.02em"
              >
                {setup.paddle?.name}
              </Heading>
              <Text color="var(--color-text-secondary)" fontFamily="var(--font-body)">
                Setup by @{setup.authorName}
              </Text>
              <Box w="48px" h="3px" bg="var(--color-secondary)" mt={2} />
            </Box>
            {isAuthor && (
              <HStack>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  borderRadius="full"
                  onClick={onOpen}
                >
                  Delete
                </Button>
              </HStack>
            )}
          </HStack>

          {/* Main content: canvas + photo */}
          <SimpleGrid columns={{ base: 1, md: setup.photoUrl ? 2 : 1 }} spacing={6}>
            <Box>
              <Text
                color="var(--color-text-secondary)"
                fontSize="xs"
                mb={2}
                fontWeight="bold"
                fontFamily="var(--font-body)"
                textTransform="uppercase"
                letterSpacing="0.05em"
              >
                Lead Tape Placement
              </Text>
              <Center
                bg="white"
                boxShadow="0 4px 20px rgba(0,0,0,0.08)"
                borderRadius={0}
                p={4}
              >
                <SetupCanvas
                  strips={setup.leadTapeStrips || []}
                  readOnly
                  width={220}
                  paddleShape={setup.paddle?.shape}
                />
              </Center>
            </Box>
            {setup.photoUrl && (
              <Box>
                <Text
                  color="var(--color-text-secondary)"
                  fontSize="xs"
                  mb={2}
                  fontWeight="bold"
                  fontFamily="var(--font-body)"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  Setup Photo
                </Text>
                <Image
                  src={setup.photoUrl}
                  alt="Setup photo"
                  borderRadius={0}
                  maxH="360px"
                  objectFit="cover"
                  w="100%"
                />
              </Box>
            )}
          </SimpleGrid>

          {/* Mod Details */}
          <Box
            bg="white"
            borderLeft="3px solid var(--color-primary)"
            boxShadow="0 4px 20px rgba(0,0,0,0.08)"
            borderRadius={0}
            p={5}
          >
            <Text
              color="var(--color-text-primary)"
              fontWeight="bold"
              mb={4}
              fontFamily="var(--font-body)"
            >
              Setup Details
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <Box>
                <Text color="var(--color-text-secondary)" fontSize="xs" textTransform="uppercase"
                  letterSpacing="wide" fontFamily="var(--font-body)">Lead Tape</Text>
                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight={600}
                  fontFamily="var(--font-body)">
                  {setup.leadTapeTotalGrams > 0
                    ? `${setup.leadTapeTotalGrams}g total (${setup.leadTapeStrips?.length} strip${setup.leadTapeStrips?.length !== 1 ? 's' : ''})`
                    : 'None'}
                </Text>
              </Box>
              <Box>
                <Text color="var(--color-text-secondary)" fontSize="xs" textTransform="uppercase"
                  letterSpacing="wide" fontFamily="var(--font-body)">Total Weight</Text>
                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight={600}
                  fontFamily="var(--font-body)">
                  {setup.totalWeightGrams > 0 ? `${setup.totalWeightGrams} oz` : '—'}
                </Text>
              </Box>
              <Box>
                <Text color="var(--color-text-secondary)" fontSize="xs" textTransform="uppercase"
                  letterSpacing="wide" fontFamily="var(--font-body)">Overgrip</Text>
                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight={600}
                  fontFamily="var(--font-body)">
                  {setup.overgrip?.brand
                    ? `${setup.overgrip.brand}${setup.overgrip?.count > 0 ? ` × ${setup.overgrip.count}` : ''}`
                    : '—'}
                </Text>
              </Box>
              <Box>
                <Text color="var(--color-text-secondary)" fontSize="xs" textTransform="uppercase"
                  letterSpacing="wide" fontFamily="var(--font-body)">Undergrip</Text>
                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight={600}
                  fontFamily="var(--font-body)">{setup.undergrip || '—'}</Text>
              </Box>
              <Box>
                <Text color="var(--color-text-secondary)" fontSize="xs" textTransform="uppercase"
                  letterSpacing="wide" fontFamily="var(--font-body)">Edge Guard</Text>
                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight={600}
                  fontFamily="var(--font-body)">{setup.edgeGuard?.brand || '—'}</Text>
                {setup.edgeGuard?.notes && (
                  <Text color="var(--color-text-secondary)" fontSize="xs"
                    fontFamily="var(--font-body)">{setup.edgeGuard.notes}</Text>
                )}
              </Box>
            </SimpleGrid>

            {/* Per-strip breakdown */}
            {setup.leadTapeStrips?.length > 0 && (
              <Box mt={5}>
                <Text color="var(--color-text-secondary)" fontSize="xs" textTransform="uppercase"
                  letterSpacing="wide" mb={2} fontFamily="var(--font-body)">Lead Tape Strips</Text>
                <VStack spacing={2} align="stretch">
                  {setup.leadTapeStrips.map((strip, i) => (
                    <HStack
                      key={i}
                      bg="white"
                      borderLeft="3px solid var(--color-primary)"
                      boxShadow="0 1px 6px rgba(0,0,0,0.05)"
                      px={3} py={2} spacing={4} flexWrap="wrap"
                    >
                      <Text color="var(--color-text-secondary)" fontSize="xs" minW="20px">#{i + 1}</Text>
                      {strip.label && (
                        <Box>
                          <Text color="var(--color-text-secondary)" fontSize="xs">Position</Text>
                          <Text color="var(--color-text-primary)" fontSize="sm" fontWeight={600}>{strip.label}</Text>
                        </Box>
                      )}
                      {strip.lengthInches > 0 && (
                        <Box>
                          <Text color="var(--color-text-secondary)" fontSize="xs">Length</Text>
                          <Text color="var(--color-text-primary)" fontSize="sm" fontWeight={600}>{strip.lengthInches} in</Text>
                        </Box>
                      )}
                      {strip.densityGramsPerInch > 0 && (
                        <Box>
                          <Text color="var(--color-text-secondary)" fontSize="xs">Density</Text>
                          <Text color="var(--color-text-primary)" fontSize="sm" fontWeight={600}>{strip.densityGramsPerInch} g/in</Text>
                        </Box>
                      )}
                      {strip.weightGrams > 0 && (
                        <Box>
                          <Text color="var(--color-text-secondary)" fontSize="xs">Weight</Text>
                          <Text color="var(--color-text-primary)" fontSize="sm" fontWeight={600}>{strip.weightGrams} g</Text>
                        </Box>
                      )}
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {setup.notes && (
              <Box mt={4}>
                <Text color="var(--color-text-secondary)" fontSize="xs" textTransform="uppercase"
                  letterSpacing="wide" fontFamily="var(--font-body)">Notes</Text>
                <Text color="var(--color-text-primary)" fontSize="sm" mt={1}
                  fontFamily="var(--font-body)">{setup.notes}</Text>
              </Box>
            )}
          </Box>

          {/* Why this setup */}
          {setup.setupReasoning && (
            <Box
              bg="white"
              borderLeft="3px solid var(--color-primary)"
              boxShadow="0 4px 20px rgba(0,0,0,0.08)"
              borderRadius={0}
              p={5}
            >
              <Text color="var(--color-text-secondary)" fontSize="xs" textTransform="uppercase"
                letterSpacing="wide" mb={2} fontFamily="var(--font-body)">Why This Setup?</Text>
              <Text color="var(--color-text-primary)" fontSize="sm" whiteSpace="pre-wrap"
                fontFamily="var(--font-body)">{setup.setupReasoning}</Text>
            </Box>
          )}

          {/* Like button */}
          <HStack>
            <Button
              borderRadius="full"
              px={6}
              py={2}
              fontWeight={600}
              bg={liked ? 'red.500' : 'var(--color-primary)'}
              color="white"
              _hover={{ bg: liked ? 'red.600' : '#1e4a61', transform: 'translateY(-1px)' }}
              onClick={handleLike}
              isLoading={liking}
              transition="all 0.2s ease"
              fontFamily="var(--font-body)"
            >
              ❤️ {liked ? 'Liked' : 'Like'} · {likesCount}
            </Button>
          </HStack>

          <Divider borderColor="rgba(0,0,0,0.1)" />

          {/* Comments */}
          <CommentSection targetType="setup" targetId={setupId} />

        </VStack>
      </Container>

      {/* Delete confirmation */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogContent bg="white" borderRadius={0}>
          <AlertDialogHeader
            color="var(--color-text-primary)"
            fontFamily="var(--font-display)"
          >
            Delete Setup
          </AlertDialogHeader>
          <AlertDialogBody color="var(--color-text-secondary)" fontFamily="var(--font-body)">
            Are you sure? This cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} borderRadius="full" variant="outline">
              Cancel
            </Button>
            <Button colorScheme="red" borderRadius="full" onClick={handleDelete} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default SetupDetailPage;
