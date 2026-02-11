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
  Select,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Heading,
  Center,
  Spinner,
} from '@chakra-ui/react';
import React, { useState, useMemo, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { usePlayerStore } from '../store/player';
import { Link, useLocation } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import { SearchIcon } from '@chakra-ui/icons';
import { FaFilter } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// Isolated header so it doesn't re-render when players/filters load (avoids animation jank)
// Animation matches Paddles page header exactly for comparison
const PlayersPageHeader = React.memo(({ headerRef, headerInView, onAnimationComplete }) => (
  <MotionVStack
    ref={headerRef}
    spacing={6}
    w="full"
    align="center"
    initial={{ opacity: 0, y: 30 }}
    animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    onAnimationComplete={() => headerInView && onAnimationComplete?.()}
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
      Players
    </MotionHeading>
  </MotionVStack>
));

PlayersPageHeader.displayName = 'PlayersPageHeader';

const FALLBACK_CONTENT_READY_MS = 550;

const Players = () => {
  const { fetchPlayers, players } = usePlayerStore();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const [contentReady, setContentReady] = useState(false);

  const handleHeaderAnimationComplete = useCallback(() => setContentReady(true), []);

  // Fallback: show list after 700ms if header callback never fires (e.g. header off-screen on load)
  useEffect(() => {
    const t = setTimeout(() => setContentReady(true), FALLBACK_CONTENT_READY_MS);
    return () => clearTimeout(t);
  }, []);

  // Initialize search query from URL parameters
  const [searchQuery, setSearchQuery] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('search') || '';
  });

  // Filter states - load from localStorage or use defaults
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('playerFilters');
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
    return {
      paddle: '',
      paddleThickness: '',
      paddleShape: '',
      shoeModel: '',
      mlpTeam: '',
      ageRange: '',
      overgrips: '',
      totalWeight: '',
      weightComplete: '',
      sponsor: '',
    };
  });

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const options = {
      paddle: [...new Set(players.map(p => p.paddle).filter(Boolean))],
      paddleThickness: [
        ...new Set(players.map(p => p.paddleThickness).filter(Boolean)),
      ],
      paddleShape: [
        ...new Set(players.map(p => p.paddleShape).filter(Boolean)),
      ],
      shoeModel: [...new Set(players.map(p => p.shoeModel).filter(Boolean))],
      mlpTeam: [...new Set(players.map(p => p.mlpTeam).filter(Boolean))],
      overgrips: [...new Set(players.map(p => p.overgrips).filter(Boolean))],
      totalWeight: [...new Set(players.map(p => p.totalWeight).filter(Boolean))],
      sponsor: [...new Set(players.map(p => p.sponsor).filter(Boolean))],
    };
    return options;
  }, [players]);

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once on mount - fetchPlayers is stable from Zustand

  useEffect(() => {
    document.title = 'Pickleball Settings';
    return () => {
      document.title = 'Pickleball Settings';
    };
  }, []);

  useEffect(() => {
    sessionStorage.removeItem('restorePaddleListScroll');
    sessionStorage.removeItem('paddleListScrollPosition');
  }, []);

  // Restore scroll position immediately on mount (before paint) to prevent flash
  useLayoutEffect(() => {
    const shouldRestore = sessionStorage.getItem('restorePlayerListScroll') === 'true';
    const savedScrollPosition = sessionStorage.getItem('playerListScrollPosition');
    
    if (shouldRestore && savedScrollPosition) {
      const scrollPos = parseInt(savedScrollPosition, 10);
      if (!isNaN(scrollPos)) {
        // Set scroll position immediately, before browser paints
        window.scrollTo(0, scrollPos);
        // Also set document.documentElement.scrollTop for better compatibility
        document.documentElement.scrollTop = scrollPos;
        document.body.scrollTop = scrollPos;
      }
    } else if (!shouldRestore) {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location.search]);

  useEffect(() => {
    localStorage.setItem('playerFilters', JSON.stringify(filters));
  }, [filters]);

  // Filter players based on search query and filters
  const filteredPlayers = useMemo(() => {
    let filtered = players;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        player =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (player.sponsor &&
            player.sponsor.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        filtered = filtered.filter(player => {
          if (key === 'ageRange') {
            const age = parseInt(player.age);
            if (!age) return false;

            switch (value) {
              case '18-25':
                return age >= 18 && age <= 25;
              case '26-35':
                return age >= 26 && age <= 35;
              case '36-45':
                return age >= 36 && age <= 45;
              case '46+':
                return age >= 46;
              default:
                return true;
            }
          }

          if (key === 'weightComplete') {
            if (value === 'yes') {
              return player.weightImage && player.weightLocation;
            } else if (value === 'no') {
              return !player.weightImage || !player.weightLocation;
            }
            return true;
          }

          return (
            player[key] &&
            player[key].toLowerCase().includes(value.toLowerCase())
          );
        });
      }
    });

    return filtered;
  }, [players, searchQuery, filters]);

  // Fine-tune scroll position after content loads (if needed)
  useEffect(() => {
    if (players.length === 0) return; // Wait for data to load
    
    const shouldRestore = sessionStorage.getItem('restorePlayerListScroll') === 'true';
    const savedScrollPosition = sessionStorage.getItem('playerListScrollPosition');
    
    if (shouldRestore && savedScrollPosition) {
      // Fine-tune scroll position after content renders
      const scrollPos = parseInt(savedScrollPosition, 10);
      if (!isNaN(scrollPos)) {
        // Use RAF to ensure content is rendered, then fine-tune
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPos);
          // Clear flags after successful restoration
          sessionStorage.removeItem('playerListScrollPosition');
          sessionStorage.removeItem('restorePlayerListScroll');
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length]); // Only depend on players.length, not filteredPlayers

  const handlePlayerDeleted = () => {
    fetchPlayers();
  };

  const clearFilters = () => {
    const clearedFilters = {
      paddle: '',
      paddleThickness: '',
      paddleShape: '',
      shoeModel: '',
      mlpTeam: '',
      ageRange: '',
      overgrips: '',
      totalWeight: '',
      weightComplete: '',
      sponsor: '',
    };
    setFilters(clearedFilters);
    localStorage.setItem('playerFilters', JSON.stringify(clearedFilters));
  };

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== ''
  ).length;

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
          {/* Simple Header - memoized so it doesn't re-render when players load (smoother animation) */}
          <PlayersPageHeader headerRef={headerRef} headerInView={headerInView} onAnimationComplete={handleHeaderAnimationComplete} />

          {/* Search and Filter - Clean Design */}
          <VStack 
            w='full' 
            spacing={{ base: 4, md: 5 }}
            maxW="800px"
          >
            <HStack w='full' spacing={4} align="center">
              <Box flex={1}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents='none' h="100%">
                    <SearchIcon color="var(--color-text-secondary)" />
                  </InputLeftElement>
                  <Input
                    placeholder='Search players by name or sponsor...'
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
                <Tooltip label='Filter Players' placement='top'>
                  <IconButton
                    icon={<FaFilter />}
                    onClick={onOpen}
                    size="lg"
                    h="56px"
                    w="56px"
                    bg={activeFiltersCount > 0 ? "var(--color-primary)" : "white"}
                    color={activeFiltersCount > 0 ? "white" : "var(--color-text-primary)"}
                    border="1px solid"
                    borderColor={activeFiltersCount > 0 ? "var(--color-primary)" : "rgba(0, 0, 0, 0.1)"}
                    borderRadius="full"
                    aria-label='Filter players'
                    position='relative'
                    _hover={{
                      bg: activeFiltersCount > 0 ? "var(--color-accent)" : "var(--color-primary)",
                      color: "white",
                      borderColor: activeFiltersCount > 0 ? "var(--color-accent)" : "var(--color-primary)",
                    }}
                    transition="all 0.3s ease"
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {activeFiltersCount > 0 && (
                      <MotionBox
                        position="absolute"
                        top={-1}
                        right={-1}
                        w="20px"
                        h="20px"
                        bg="var(--color-secondary)"
                        color="white"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight={700}
                        fontFamily="var(--font-body)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        {activeFiltersCount}
                      </MotionBox>
                    )}
                  </IconButton>
                </Tooltip>

                <MotionText
                  fontSize={{ base: 'md', md: 'lg' }}
                  color="var(--color-text-secondary)"
                  fontFamily="var(--font-body)"
                  fontWeight={400}
                  whiteSpace="nowrap"
                  initial={{ opacity: 1 }}
                  animate={headerInView ? { opacity: 1 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
                </MotionText>
              </HStack>
            </HStack>

            {/* Active Filters Display */}
            {(activeFiltersCount > 0 || searchQuery.trim()) && (
              <MotionBox
                w='full'
                bg="white"
                p={5}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.08)"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <HStack w='full' flexWrap='wrap' spacing={3}>
                  <Text 
                    fontSize='sm' 
                    color="var(--color-text-secondary)" 
                    fontWeight='500'
                    fontFamily="var(--font-body)"
                  >
                    Filters:
                  </Text>
                  {Object.entries(filters).map(
                    ([key, value]) =>
                      value && (
                        <Badge 
                          key={key} 
                          bg="var(--color-primary)"
                          color="white"
                          borderRadius="full"
                          fontFamily="var(--font-body)"
                          fontSize="xs"
                          px={3}
                          py={1}
                          fontWeight={600}
                          as={motion.div}
                          whileHover={{ scale: 1.1 }}
                        >
                          {key}: {value}
                        </Badge>
                      )
                  )}
                  {searchQuery.trim() && (
                    <Badge 
                      bg="var(--color-secondary)"
                      color="white"
                      borderRadius="full"
                      fontFamily="var(--font-body)"
                      fontSize="xs"
                      px={3}
                      py={1}
                      fontWeight={600}
                      as={motion.div}
                      whileHover={{ scale: 1.1 }}
                    >
                      "{searchQuery}"
                    </Badge>
                  )}
                  <Button 
                    size='xs' 
                    variant='ghost' 
                    onClick={clearFilters}
                    borderRadius="full"
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    color="var(--color-text-secondary)"
                    fontSize="xs"
                    _hover={{
                      color: "var(--color-primary)",
                      bg: "rgba(44, 95, 124, 0.05)",
                    }}
                    transition="all 0.2s"
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear all
                  </Button>
                </HStack>
              </MotionBox>
            )}
          </VStack>

          {/* Players Grid - Simple and Clean */}
          <MotionBox
            w="full"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {players.length === 0 || !contentReady ? (
              <Center py={16}>
                <Spinner size="xl" color="var(--color-primary)" thickness="4px" />
              </Center>
            ) : filteredPlayers.length === 0 ? (
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
                  {searchQuery.trim() || activeFiltersCount > 0 ? (
                    <>
                      No players found
                      <br />
                      <Text 
                        fontSize={{ base: 'md', md: 'lg' }} 
                        mt={4}
                        fontFamily="var(--font-body)"
                        color="var(--color-text-secondary)"
                        fontWeight={400}
                      >
                        Try adjusting your search or filters
                      </Text>
                    </>
                  ) : (
                    <>
                      No players yet
                      <br />
                      <Link to={'/create'}>
                        <Text
                          as='span'
                          color="var(--color-primary)"
                          fontFamily="var(--font-body)"
                          fontWeight={600}
                          fontSize={{ base: 'md', md: 'lg' }}
                          _hover={{ 
                            textDecoration: 'underline',
                          }}
                          transition="color 0.2s"
                        >
                          Create the first one
                        </Text>
                      </Link>
                    </>
                  )}
                </MotionText>
              </Box>
            ) : (
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={{ base: 8, md: 10 }}
                w={'full'}
              >
                {filteredPlayers.map((player) => (
                  <Box key={player._id}>
                    <PlayerCard
                      player={player}
                      onPlayerDeleted={handlePlayerDeleted}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </MotionBox>
        </VStack>

        {/* Filter Drawer */}
        <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
          <DrawerOverlay />
          <DrawerContent
            sx={{
              fontFamily: 'var(--font-body)',
            }}
            borderRadius="0"
          >
            <DrawerCloseButton />
            <DrawerHeader 
              borderBottomWidth='1px'
              borderColor="rgba(0, 0, 0, 0.1)"
              fontFamily="var(--font-display)"
              fontSize="2xl"
              fontWeight={600}
              color="var(--color-text-primary)"
              py={6}
            >
              Filter Players
            </DrawerHeader>

            <DrawerBody py={8}>
              <VStack spacing={6} align='stretch'>
                {/* Paddle Filter */}
                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Paddle
                  </Text>
                  <Select
                    placeholder='All paddles'
                    value={filters.paddle}
                    onChange={e =>
                      setFilters({ ...filters, paddle: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    {filterOptions.paddle.map(paddle => (
                      <option key={paddle} value={paddle}>
                        {paddle}
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* Paddle Thickness Filter */}
                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Paddle Thickness
                  </Text>
                  <Select
                    placeholder='All thicknesses'
                    value={filters.paddleThickness}
                    onChange={e =>
                      setFilters({ ...filters, paddleThickness: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    {filterOptions.paddleThickness.map(thickness => (
                      <option key={thickness} value={thickness}>
                        {thickness}
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* Paddle Shape Filter */}
                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Paddle Shape
                  </Text>
                  <Select
                    placeholder='All shapes'
                    value={filters.paddleShape}
                    onChange={e =>
                      setFilters({ ...filters, paddleShape: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    {filterOptions.paddleShape.map(shape => (
                      <option key={shape} value={shape}>
                        {shape}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Divider borderColor="rgba(0, 0, 0, 0.1)" />

                {/* Shoes Filter */}
                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Shoe Model
                  </Text>
                  <Select
                    placeholder='All shoes'
                    value={filters.shoeModel}
                    onChange={e =>
                      setFilters({ ...filters, shoeModel: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    {filterOptions.shoeModel.map(shoe => (
                      <option key={shoe} value={shoe}>
                        {shoe}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Divider borderColor="rgba(0, 0, 0, 0.1)" />

                {/* Age Range Filter */}
                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Age Range
                  </Text>
                  <Select
                    placeholder='All ages'
                    value={filters.ageRange}
                    onChange={e =>
                      setFilters({ ...filters, ageRange: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    <option value='18-25'>18-25</option>
                    <option value='26-35'>26-35</option>
                    <option value='36-45'>36-45</option>
                    <option value='46+'>46+</option>
                  </Select>
                </Box>

                {/* MLP Team Filter */}
                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    MLP Team
                  </Text>
                  <Select
                    placeholder='All teams'
                    value={filters.mlpTeam}
                    onChange={e =>
                      setFilters({ ...filters, mlpTeam: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    {filterOptions.mlpTeam.map(team => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Divider borderColor="rgba(0, 0, 0, 0.1)" />

                {/* Modifications Filters */}
                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Overgrips
                  </Text>
                  <Select
                    placeholder='All overgrips'
                    value={filters.overgrips}
                    onChange={e =>
                      setFilters({ ...filters, overgrips: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    {filterOptions.overgrips.map(overgrip => (
                      <option key={overgrip} value={overgrip}>
                        {overgrip}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Total Weight
                  </Text>
                  <Select
                    placeholder='All total weights'
                    value={filters.totalWeight}
                    onChange={e =>
                      setFilters({ ...filters, totalWeight: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    {filterOptions.totalWeight.map(totalWeight => (
                      <option key={totalWeight} value={totalWeight}>
                        {totalWeight}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Weight Info
                  </Text>
                  <Select
                    placeholder='All players'
                    value={filters.weightComplete}
                    onChange={e =>
                      setFilters({ ...filters, weightComplete: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    <option value='yes'>Known weight setup</option>
                    <option value='no'>Unknown weight setup</option>
                  </Select>
                </Box>

                <Box>
                  <Text 
                    fontWeight='600' 
                    mb={3}
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                    fontSize="sm"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Sponsor
                  </Text>
                  <Select
                    placeholder='All sponsors'
                    value={filters.sponsor}
                    onChange={e =>
                      setFilters({ ...filters, sponsor: e.target.value })
                    }
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(0, 0, 0, 0.1)"
                    h="48px"
                    fontSize="md"
                    _focus={{
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    }}
                  >
                    {filterOptions.sponsor.map(sponsor => (
                      <option key={sponsor} value={sponsor}>
                        {sponsor}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Divider borderColor="rgba(0, 0, 0, 0.1)" />

                {/* Action Buttons */}
                <HStack spacing={4} pt={4}>
                  <Button 
                    onClick={onClose} 
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    variant='outline' 
                    onClick={clearFilters} 
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Clear All
                  </Button>
                </HStack>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Container>
    </Box>
  );
};

export default Players;
