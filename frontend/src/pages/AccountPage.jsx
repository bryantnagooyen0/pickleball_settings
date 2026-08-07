import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  Center,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
import { motion, useInView } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import UserComments from '../components/UserComments';
import AdminComments from '../components/AdminComments';
import SetupCard from '../components/SetupCard';
import { useAuth } from '../hooks/useAuth';
import { useSetupStore } from '../store/setup';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

function AccountPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const headerRef = useRef(null);
  const accountRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0 });
  const accountInView = useInView(accountRef, { once: true, amount: 0 });

  const fetchSetupsByAuthor = useSetupStore((s) => s.fetchSetupsByAuthor);
  const [mySetups, setMySetups] = useState([]);
  const [setupsLoading, setSetupsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setSetupsLoading(true);
    fetchSetupsByAuthor(user.id).then((result) => {
      if (cancelled) return;
      if (result.success) setMySetups(result.data);
      setSetupsLoading(false);
    });
    return () => { cancelled = true; };
  }, [user?.id, fetchSetupsByAuthor]);
  
  let token;
  let username;
  try {
    token = localStorage.getItem('token');
    username = localStorage.getItem('username');
  } catch (_) {
    token = null;
    username = null;
  }

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="var(--color-bg)"
        sx={{
          background: 'radial-gradient(circle at 20% 50%, rgba(44, 95, 124, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.03) 0%, transparent 50%), var(--color-bg)',
        }}
      >
        <Container maxW='container.xl' py={12}>
          <Center>
            <Spinner size='xl' color="var(--color-primary)" />
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="var(--color-bg)"
      sx={{
        background: 'radial-gradient(circle at 20% 50%, rgba(44, 95, 124, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.03) 0%, transparent 50%), var(--color-bg)',
        '--font-display': '"Merriweather", serif',
        '--font-body': '"Inter", sans-serif',
        '--color-primary': '#2C5F7C',
        '--color-secondary': '#6B8E9F',
        '--color-accent': '#FF6B6B',
        '--color-bg': '#FAF9F6',
        '--color-text-primary': '#1A1A1A',
        '--color-text-secondary': '#666666',
      }}
    >
      <Container maxW='container.xl' py={{ base: 12, md: 16 }} position="relative" zIndex={1}>
        <VStack spacing={{ base: 6, md: 8 }}>
          {/* Header */}
          <MotionVStack
            ref={headerRef}
            spacing={4}
            w="full"
            align="center"
            initial={{ opacity: 1, y: 0 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <MotionHeading
              as="h1"
              fontSize={{ base: '3rem', md: '4.5rem', lg: '5.5rem' }}
              fontFamily="var(--font-display)"
              fontWeight={700}
              letterSpacing="-0.02em"
              textAlign="center"
              color="var(--color-text-primary)"
            >
              My Account
            </MotionHeading>
          </MotionVStack>

          {/* Account Info */}
          <MotionBox
            ref={accountRef}
            w="full"
            maxW="900px"
            bg="white"
            borderRadius={0}
            p={{ base: 6, md: 8 }}
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
            initial={{ opacity: 1, y: 0 }}
            animate={accountInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <VStack align="start" spacing={4}>
              {token ? (
                <VStack align="start" spacing={3} w="full">
                  <Text
                    fontSize="sm"
                    color="var(--color-text-secondary)"
                    fontFamily="var(--font-body)"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    Account Status
                  </Text>
                  <HStack spacing={3}>
                    <Text
                      fontSize="lg"
                      fontWeight={600}
                      fontFamily="var(--font-body)"
                      color="var(--color-text-primary)"
                    >
                      Logged in as
                    </Text>
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg="var(--color-primary)"
                      color="white"
                      fontSize="md"
                      fontFamily="var(--font-body)"
                      fontWeight={600}
                    >
                      {username || 'Unknown user'}
                    </Badge>
                  </HStack>
                  {user?.role === 'admin' && (
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg="var(--color-accent)"
                      color="white"
                      fontSize="sm"
                      fontFamily="var(--font-body)"
                      fontWeight={600}
                    >
                      Administrator
                    </Badge>
                  )}
                </VStack>
              ) : (
                <Text
                  fontSize="md"
                  fontFamily="var(--font-body)"
                  color="var(--color-text-secondary)"
                >
                  Not logged in.
                </Text>
              )}
            </VStack>
          </MotionBox>

          {/* My Setups Section */}
          {token && (
            <MotionBox
              w="full"
              maxW="900px"
              bg="white"
              borderRadius={0}
              p={{ base: 6, md: 8 }}
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <VStack align="start" spacing={4} w="full">
                <HStack justify="space-between" w="full" align="center" flexWrap="wrap" gap={2}>
                  <Heading
                    as="h2"
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontFamily="var(--font-display)"
                    fontWeight={700}
                    color="var(--color-text-primary)"
                  >
                    My Setups
                    {!setupsLoading && mySetups.length > 0 && ` (${mySetups.length})`}
                  </Heading>
                  <Button
                    as={RouterLink}
                    to="/community/new"
                    size="sm"
                    borderRadius={0}
                    bg="var(--color-primary)"
                    color="white"
                    fontFamily="var(--font-body)"
                    _hover={{ bg: 'var(--color-primary)', opacity: 0.9 }}
                  >
                    Share a Setup
                  </Button>
                </HStack>

                {setupsLoading ? (
                  <Center w="full" py={6}>
                    <Spinner color="var(--color-primary)" />
                  </Center>
                ) : mySetups.length === 0 ? (
                  <Box
                    bg="var(--color-bg)"
                    p={6}
                    borderRadius={0}
                    w="full"
                    border="1px dashed"
                    borderColor="rgba(0, 0, 0, 0.1)"
                  >
                    <Text
                      fontSize="sm"
                      color="var(--color-text-secondary)"
                      textAlign="center"
                      fontFamily="var(--font-body)"
                    >
                      You haven't shared a setup yet. Post your paddle and lead tape
                      layout so other players can see what you're running.
                    </Text>
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} w="full">
                    {mySetups.map((setup) => (
                      <SetupCard key={setup._id} setup={setup} compact />
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
            </MotionBox>
          )}

          {/* Admin Comments Section */}
          {token && !loading && user?.role === 'admin' && (
            <MotionBox
              w="full"
              maxW="900px"
              bg="white"
              borderRadius={0}
              p={{ base: 6, md: 8 }}
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <VStack align="stretch" spacing={6}>
                <VStack align="start" spacing={2}>
                  <Heading
                    as="h2"
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontFamily="var(--font-display)"
                    fontWeight={700}
                    color="var(--color-accent)"
                  >
                    Admin Panel - Comment Management
                  </Heading>
                  <Text
                    color="var(--color-text-secondary)"
                    fontSize="sm"
                    fontFamily="var(--font-body)"
                  >
                    Manage all comments across the platform. You can view, delete, and moderate comments.
                  </Text>
                </VStack>
                <AdminComments />
              </VStack>
            </MotionBox>
          )}

          {/* User Comments Section */}
          {token && (
            <MotionBox
              w="full"
              maxW="900px"
              bg="white"
              borderRadius={0}
              p={{ base: 6, md: 8 }}
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <UserComments />
            </MotionBox>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default AccountPage;
