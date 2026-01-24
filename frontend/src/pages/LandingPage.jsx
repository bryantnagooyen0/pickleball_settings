import {
  Container,
  VStack,
  Text,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  HStack,
  Button,
  Heading,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/player';
import { usePaddleStore } from '../store/paddle';
import { Link, useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import { SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { FaUsers } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);

const LandingPage = () => {
  const { fetchPlayers, players } = usePlayerStore();
  const { fetchPaddles, paddles } = usePaddleStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { scrollYProgress } = useScroll();
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  
  const statsInView = useInView(statsRef, { once: true, amount: 0, margin: '-600px 0px' });
  const categoriesInView = useInView(statsRef, { once: true, amount: 0.1 });

  useEffect(() => {
    fetchPlayers();
    fetchPaddles();
  }, [fetchPlayers, fetchPaddles]);

  // Always start at top on landing page and clear any list restore flags
  useEffect(() => {
    window.scrollTo(0, 0);
    sessionStorage.removeItem('restorePlayerListScroll');
    sessionStorage.removeItem('playerListScrollPosition');
    sessionStorage.removeItem('restorePaddleListScroll');
    sessionStorage.removeItem('paddleListScrollPosition');
  }, []);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Get featured players (first 6 players)
  const featuredPlayers = useMemo(() => {
    return players.slice(0, 6);
  }, [players]);

  // Get recent players (last 4 players)
  const recentPlayers = useMemo(() => {
    return players.slice(-4).reverse();
  }, [players]);

  // Get unique paddle brands for stats
  const uniquePaddles = useMemo(() => {
    return [...new Set(players.map(p => p.paddle).filter(Boolean))].length;
  }, [players]);

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/players?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/players');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <Box
      sx={{
        '--font-display': '"Playfair Display", serif',
        '--font-body': '"Inter", sans-serif',
        '--font-accent': '"Space Grotesk", sans-serif',
        '--color-primary': '#2C5F7C',
        '--color-secondary': '#D4A574',
        '--color-accent': '#8B9DC3',
        '--color-bg': '#FAF9F6',
        '--color-bg-dark': '#1A1A1A',
        '--color-text-primary': '#1A1A1A',
        '--color-text-secondary': '#6B6B6B',
        fontFamily: 'var(--font-body)',
      }}
      bg="var(--color-bg)"
      minH="100vh"
      position="relative"
      overflow="hidden"
    >
      {/* Fluid gradient background */}
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
            radial-gradient(circle at 20% 30%, rgba(44, 95, 124, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(212, 165, 116, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(139, 157, 195, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Hero Section */}
      <MotionBox
        ref={heroRef}
        style={{ y: heroParallax, opacity: heroOpacity }}
        position="relative"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        bg="var(--color-bg)"
        zIndex={1}
      >
        {/* Animated fluid shapes */}
        <MotionBox
          position="absolute"
          top="10%"
          left="10%"
          w="400px"
          h="400px"
          borderRadius="30% 70% 70% 30% / 30% 30% 70% 70%"
          bg="rgba(44, 95, 124, 0.1)"
          filter="blur(60px)"
          style={{
            x: useTransform(smoothMouseX, [-0.5, 0.5], [-50, 50]),
            y: useTransform(smoothMouseY, [-0.5, 0.5], [-50, 50]),
          }}
          animate={{
            borderRadius: [
              '30% 70% 70% 30% / 30% 30% 70% 70%',
              '70% 30% 30% 70% / 70% 70% 30% 30%',
              '30% 70% 70% 30% / 30% 30% 70% 70%',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <MotionBox
          position="absolute"
          bottom="15%"
          right="15%"
          w="500px"
          h="500px"
          borderRadius="60% 40% 30% 70% / 60% 30% 70% 40%"
          bg="rgba(212, 165, 116, 0.1)"
          filter="blur(60px)"
          style={{
            x: useTransform(smoothMouseX, [-0.5, 0.5], [50, -50]),
            y: useTransform(smoothMouseY, [-0.5, 0.5], [50, -50]),
          }}
          animate={{
            borderRadius: [
              '60% 40% 30% 70% / 60% 30% 70% 40%',
              '30% 60% 70% 40% / 50% 60% 30% 60%',
              '60% 40% 30% 70% / 60% 30% 70% 40%',
            ],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <Container maxW="container.xl" position="relative" zIndex={2}>
          <VStack spacing={16} textAlign="center" py={32}>
            {/* Main Heading with elegant reveal */}
            <MotionVStack
              spacing={8}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <MotionHeading
                as="h1"
                fontSize={{ base: '4rem', md: '7rem', lg: '9rem' }}
                fontWeight={700}
                fontFamily="var(--font-display)"
                letterSpacing="-0.02em"
                lineHeight="0.95"
                color="var(--color-text-primary)"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Pickleball
              </MotionHeading>
              <MotionHeading
                as="h2"
                fontSize={{ base: '3rem', md: '5rem', lg: '7rem' }}
                fontWeight={300}
                fontFamily="var(--font-display)"
                fontStyle="italic"
                letterSpacing="0.02em"
                lineHeight="1"
                color="var(--color-primary)"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                Settings
              </MotionHeading>

              <MotionBox
                w="120px"
                h="2px"
                bg="var(--color-secondary)"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              <MotionText
                fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
                color="var(--color-text-secondary)"
                maxW="2xl"
                fontFamily="var(--font-body)"
                fontWeight={400}
                letterSpacing="0.01em"
                lineHeight="1.8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Discover the equipment, settings, and gear used by professional pickleball players.
                <br />
                <Box as="span" color="var(--color-text-secondary)" fontWeight={500}>
                  Find your perfect setup and elevate your game.
                </Box>
              </MotionText>
            </MotionVStack>

            {/* Search Bar with elegant styling */}
            <MotionBox
              w="full"
              maxW="700px"
              as="form"
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none" h="100%">
                  <SearchIcon color="var(--color-text-secondary)" />
                </InputLeftElement>
                <Input
                  placeholder="Search players by name or sponsor..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  bg="white"
                  color="var(--color-text-primary)"
                  border="1px solid"
                  borderColor="rgba(0, 0, 0, 0.1)"
                  borderRadius="0"
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
            </MotionBox>

            {/* CTA Buttons with fluid hover effects */}
            <MotionHStack
              spacing={6}
              flexWrap="wrap"
              justify="center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to="/players">
                <Button
                  as={motion.button}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  size="lg"
                  h="56px"
                  px={10}
                  bg="var(--color-primary)"
                  color="white"
                  border="none"
                  borderRadius="0"
                  fontSize="md"
                  fontFamily="var(--font-body)"
                  fontWeight={500}
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  rightIcon={<ArrowForwardIcon />}
                  _hover={{
                    bg: "var(--color-accent)",
                  }}
                  transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  position="relative"
                  overflow="hidden"
                >
                  <MotionBox
                    position="absolute"
                    top={0}
                    left="-100%"
                    w="100%"
                    h="100%"
                    bg="rgba(255, 255, 255, 0.2)"
                    whileHover={{ left: '100%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                  <Box position="relative" zIndex={1}>Browse Players</Box>
                </Button>
              </Link>
              <Link to="/paddles">
                <Button
                  as={motion.button}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  size="lg"
                  h="56px"
                  px={10}
                  bg="transparent"
                  color="var(--color-primary)"
                  border="1px solid"
                  borderColor="var(--color-primary)"
                  borderRadius="0"
                  fontSize="md"
                  fontFamily="var(--font-body)"
                  fontWeight={500}
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  rightIcon={<ArrowForwardIcon />}
                  _hover={{
                    bg: "var(--color-primary)",
                    color: "white",
                  }}
                  transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                >
                  Explore Paddles
                </Button>
              </Link>
            </MotionHStack>
          </VStack>
        </Container>
      </MotionBox>

      <Container maxW="container.xl" py={8} position="relative" zIndex={1}>
        {/* Statistics Section */}
        <MotionVStack
          ref={statsRef}
          spacing={20}
          initial={{ opacity: 0 }}
          animate={statsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <MotionHeading
            as="h2"
            fontSize={{ base: '2.5rem', md: '4rem' }}
            fontFamily="var(--font-display)"
            fontWeight={600}
            textAlign="center"
            letterSpacing="-0.01em"
            color="var(--color-text-primary)"
            initial={{ opacity: 0, y: 30 }}
            animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Platform Statistics
          </MotionHeading>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={8}
            w="full"
          >
            {[
              { label: 'Total Players', value: players.length, color: 'var(--color-primary)' },
              { label: 'Paddle Brands', value: uniquePaddles, color: 'var(--color-secondary)' },
              { label: 'Paddles', value: paddles.length, color: 'var(--color-accent)' },
            ].map((stat, index) => (
              <MotionBox
                key={stat.label}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Card
                  bg="white"
                  border="none"
                  borderRadius="0"
                  p={10}
                  h="100%"
                  position="relative"
                  overflow="hidden"
                  boxShadow="0 2px 20px rgba(0, 0, 0, 0.04)"
                  _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.08)',
                  }}
                  transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="4px"
                    h="100%"
                    bg={stat.color}
                  />
                  <VStack spacing={6} align="start">
                    <Text
                      fontSize="sm"
                      fontFamily="var(--font-body)"
                      fontWeight={500}
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                      color="var(--color-text-secondary)"
                    >
                      {stat.label}
                    </Text>
                    <Text
                      fontSize={{ base: '3rem', md: '4.5rem' }}
                      fontFamily="var(--font-display)"
                      fontWeight={700}
                      lineHeight="1"
                      color={stat.color}
                    >
                      {stat.value}
                    </Text>
                  </VStack>
                </Card>
              </MotionBox>
            ))}
          </SimpleGrid>

          {/* Category Cards */}
          <VStack spacing={16} w="full" mt={12}>
            <MotionHeading
              as="h2"
              fontSize={{ base: '2.5rem', md: '4rem' }}
              fontFamily="var(--font-display)"
              fontWeight={600}
              textAlign="center"
              letterSpacing="-0.01em"
              color="var(--color-text-primary)"
              initial={{ opacity: 0, y: 30 }}
              animate={categoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Explore Categories
            </MotionHeading>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
              gap={8}
              w="full"
            >
              {[
                {
                  title: 'Players',
                  description: 'Browse professional pickleball players and their equipment setups',
                  icon: <MdPerson size={40} />,
                  link: '/players',
                  color: 'var(--color-primary)',
                },
                {
                  title: 'Paddles',
                  description: 'Discover the latest paddle models and specifications',
                  icon: <Image src="/new_paddleicon.png" alt="Paddles" width="40px" height="40px" />,
                  link: '/paddles',
                  color: 'var(--color-secondary)',
                },
                {
                  title: 'Community Setups',
                  description: 'Coming soon - Share your setup and discover how other users are playing',
                  icon: <FaUsers size={40} />,
                  link: null,
                  color: 'var(--color-accent)',
                },
              ].map((category, index) => (
                <MotionBox
                  key={category.title}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={categoriesInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.4 + index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {category.link ? (
                    <Link to={category.link}>
                      <Card
                        as={motion.div}
                        whileHover={{ scale: 1.02, y: -8 }}
                        bg="white"
                        border="none"
                        borderRadius="0"
                        p={10}
                        h="100%"
                        cursor="pointer"
                        position="relative"
                        overflow="hidden"
                        boxShadow="0 2px 20px rgba(0, 0, 0, 0.04)"
                        _hover={{
                          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.08)',
                        }}
                        transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                      >
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          w="4px"
                          h="100%"
                          bg={category.color}
                        />
                        <VStack spacing={6} align="start">
                          <Box color={category.color} opacity={0.8}>
                            {category.icon}
                          </Box>
                          <Heading
                            size="lg"
                            fontFamily="var(--font-display)"
                            fontWeight={600}
                            color="var(--color-text-primary)"
                            letterSpacing="-0.01em"
                          >
                            {category.title}
                          </Heading>
                          <Text
                            color="var(--color-text-secondary)"
                            fontFamily="var(--font-body)"
                            fontSize="md"
                            lineHeight="1.7"
                            fontWeight={400}
                          >
                            {category.description}
                          </Text>
                        </VStack>
                      </Card>
                    </Link>
                  ) : (
                    <Card
                      bg="white"
                      border="none"
                      borderRadius="0"
                      p={10}
                      h="100%"
                      position="relative"
                      overflow="hidden"
                      boxShadow="0 2px 20px rgba(0, 0, 0, 0.04)"
                      opacity={0.7}
                    >
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        w="4px"
                        h="100%"
                        bg={category.color}
                      />
                      <VStack spacing={6} align="start">
                        <Box color={category.color} opacity={0.8}>
                          {category.icon}
                        </Box>
                        <Heading
                          size="lg"
                          fontFamily="var(--font-display)"
                          fontWeight={600}
                          color="var(--color-text-primary)"
                          letterSpacing="-0.01em"
                        >
                          {category.title}
                        </Heading>
                        <Text
                          color="var(--color-text-secondary)"
                          fontFamily="var(--font-body)"
                          fontSize="md"
                          lineHeight="1.7"
                          fontWeight={400}
                        >
                          {category.description}
                        </Text>
                      </VStack>
                    </Card>
                  )}
                </MotionBox>
              ))}
            </Grid>
          </VStack>

          {/* Featured Players Section */}
          {featuredPlayers.length > 0 && (
            <VStack spacing={12} w="full" mt={20}>
              <HStack justify="space-between" w="full" flexWrap="wrap" gap={4}>
                <Heading
                  as="h2"
                  fontSize={{ base: '2.5rem', md: '4rem' }}
                  fontFamily="var(--font-display)"
                  fontWeight={600}
                  letterSpacing="-0.01em"
                  color="var(--color-text-primary)"
                >
                  Featured Players
                </Heading>
                <Link to="/players">
                  <Button
                    as={motion.button}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    rightIcon={<ArrowForwardIcon />}
                    variant="outline"
                    border="1px solid"
                    borderColor="var(--color-primary)"
                    borderRadius="0"
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                    color="var(--color-primary)"
                    _hover={{
                      bg: "var(--color-primary)",
                      color: "white",
                    }}
                    transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  >
                    View All
                  </Button>
                </Link>
              </HStack>

              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={8}
                w="full"
              >
                {players.length === 0 ? (
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <Box
                      key={i}
                      maxW="sm"
                      borderWidth="1px"
                      borderColor="rgba(0, 0, 0, 0.1)"
                      borderRadius="0"
                      overflow="hidden"
                      bg="white"
                      h="400px"
                    />
                  ))
                ) : (
                  featuredPlayers.map((player, index) => (
                    <MotionBox
                      key={player._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <PlayerCard
                        player={player}
                        onPlayerDeleted={() => fetchPlayers()}
                      />
                    </MotionBox>
                  ))
                )}
              </SimpleGrid>
            </VStack>
          )}

          {/* Recent Players Section */}
          {recentPlayers.length > 0 && (
            <VStack spacing={12} w="full" mt={20}>
              <HStack justify="space-between" w="full" flexWrap="wrap" gap={4}>
                <Heading
                  as="h2"
                  fontSize={{ base: '2.5rem', md: '4rem' }}
                  fontFamily="var(--font-display)"
                  fontWeight={600}
                  letterSpacing="-0.01em"
                  color="var(--color-text-primary)"
                >
                  Recently Added
                </Heading>
                <Link to="/players">
                  <Button
                    as={motion.button}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    rightIcon={<ArrowForwardIcon />}
                    variant="outline"
                    border="1px solid"
                    borderColor="var(--color-primary)"
                    borderRadius="0"
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                    color="var(--color-primary)"
                    _hover={{
                      bg: "var(--color-primary)",
                      color: "white",
                    }}
                    transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  >
                    View All
                  </Button>
                </Link>
              </HStack>

              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 4 }}
                spacing={8}
                w="full"
              >
                {players.length === 0 ? (
                  [1, 2, 3, 4].map((i) => (
                    <Box
                      key={i}
                      maxW="sm"
                      borderWidth="1px"
                      borderColor="rgba(0, 0, 0, 0.1)"
                      borderRadius="0"
                      overflow="hidden"
                      bg="white"
                      h="400px"
                    />
                  ))
                ) : (
                  recentPlayers.map((player, index) => (
                    <MotionBox
                      key={player._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <PlayerCard
                        player={player}
                        onPlayerDeleted={() => fetchPlayers()}
                      />
                    </MotionBox>
                  ))
                )}
              </SimpleGrid>
            </VStack>
          )}

          {/* Call to Action */}
          <MotionBox
            w="full"
            mt={24}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Box
              bg="var(--color-bg-dark)"
              border="none"
              borderRadius="0"
              p={{ base: 16, md: 20 }}
              textAlign="center"
              position="relative"
              overflow="hidden"
            >
              <VStack spacing={10}>
                <Heading
                  as="h2"
                  fontSize={{ base: '2.5rem', md: '4rem' }}
                  fontFamily="var(--font-display)"
                  fontWeight={600}
                  letterSpacing="-0.01em"
                  color="white"
                >
                  Ready to Find Your Perfect Setup?
                </Heading>
                <Text
                  fontSize={{ base: 'lg', md: 'xl' }}
                  color="rgba(255, 255, 255, 0.8)"
                  maxW="2xl"
                  fontFamily="var(--font-body)"
                  lineHeight="1.8"
                  fontWeight={400}
                >
                  Browse through professional player configurations to find the equipment
                  that matches your playing style and preferences.
                </Text>
                <HStack spacing={6} flexWrap="wrap" justify="center">
                  <Link to="/players">
                    <Button
                      as={motion.button}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                      }}
                      whileTap={{ scale: 0.98 }}
                      size="lg"
                      h="56px"
                      px={10}
                      bg="var(--color-secondary)"
                      color="white"
                      border="none"
                      borderRadius="0"
                      fontSize="md"
                      fontFamily="var(--font-body)"
                      fontWeight={500}
                      letterSpacing="0.05em"
                      textTransform="uppercase"
                      rightIcon={<ArrowForwardIcon />}
                      _hover={{
                        bg: "var(--color-accent)",
                      }}
                      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    >
                      Start Browsing
                    </Button>
                  </Link>
                  <Link to="/paddles">
                    <Button
                      as={motion.button}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                      }}
                      whileTap={{ scale: 0.98 }}
                      size="lg"
                      h="56px"
                      px={10}
                      bg="transparent"
                      color="white"
                      border="1px solid"
                      borderColor="white"
                      borderRadius="0"
                      fontSize="md"
                      fontFamily="var(--font-body)"
                      fontWeight={500}
                      letterSpacing="0.05em"
                      textTransform="uppercase"
                      rightIcon={<ArrowForwardIcon />}
                      _hover={{
                        bg: "white",
                        color: "var(--color-bg-dark)",
                      }}
                      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    >
                      Explore Paddles
                    </Button>
                  </Link>
                </HStack>
              </VStack>
            </Box>
          </MotionBox>
        </MotionVStack>
      </Container>
    </Box>
  );
};

export default LandingPage;
