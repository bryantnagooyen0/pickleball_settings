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
  Checkbox,
  CheckboxGroup,
  Divider,
  Badge,
  Flex,
  IconButton,
  Tooltip,
  Heading,
} from '@chakra-ui/react';
import React, { useState, useMemo } from 'react';
import { usePlayerStore } from '../store/player';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import { SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const Players = () => {
  const { fetchPlayers, players } = usePlayerStore();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Editorial color palette - matching landing page
  const bgColor = '#FAF7ED';
  const primaryColor = '#AE573E';
  const primaryDark = '#8B4532';
  const textPrimary = '#161412';
  const textSecondary = '#6B7280';
  const accentBg = '#F5F1E3';
  const borderColor = '#E5E7EB';
  
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
  }, [fetchPlayers]);

  // When landing on players list, ensure paddle scroll flags never affect this page
  useEffect(() => {
    sessionStorage.removeItem('restorePaddleListScroll');
    sessionStorage.removeItem('paddleListScrollPosition');
  }, []);

  // If not restoring from player detail, always start at top on initial mount
  useEffect(() => {
    const shouldRestore = sessionStorage.getItem('restorePlayerListScroll') === 'true';
    if (!shouldRestore) {
      window.scrollTo(0, 0);
    }
  }, []);

  // Update search query when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location.search]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('playerFilters', JSON.stringify(filters));
  }, [filters]);

  // Filter players based on search query and filters
  const filteredPlayers = useMemo(() => {
    let filtered = players;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        player =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (player.sponsor &&
            player.sponsor.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply other filters
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

  // Scroll position restoration (only when flagged as coming from the players list)
  useEffect(() => {
    const shouldRestore = sessionStorage.getItem('restorePlayerListScroll') === 'true';
    const savedScrollPosition = sessionStorage.getItem('playerListScrollPosition');
    if (shouldRestore && savedScrollPosition && filteredPlayers.length > 0) {
      const restoreScroll = () => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('playerListScrollPosition');
        sessionStorage.removeItem('restorePlayerListScroll');
      };
      requestAnimationFrame(() => {
        requestAnimationFrame(restoreScroll);
      });
    } else if (!shouldRestore) {
      // If not restoring, ensure we clear stale flags/positions
      sessionStorage.removeItem('restorePlayerListScroll');
    }
  }, [filteredPlayers]);

  const handlePlayerDeleted = () => {
    fetchPlayers(); // Refresh the players list after deletion
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
                All Players
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
              Professional
              <Box as="span" display="block" color={primaryColor} mt={2}>
                Players
              </Box>
            </Heading>
          </MotionBox>

          {/* Search and Filter Bar - Editorial Style */}
          <MotionBox variants={fadeInUp} w='full'>
            <VStack w='full' spacing={{ base: 4, md: 6 }}>
              <HStack w='full' spacing={{ base: 3, md: 4 }} align="stretch">
                <Box flex={1}>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents='none' h="full" pl={6}>
                      <SearchIcon color={textSecondary} boxSize={5} />
                    </InputLeftElement>
                    <Input
                      placeholder='Search players by name or sponsor...'
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

                <Tooltip label='Filter Players' placement='top'>
                  <IconButton
                    icon={<FaFilter />}
                    onClick={onOpen}
                    size="lg"
                    bg={primaryColor}
                    aria-label='Filter players'
                    color="white"
                    h="64px"
                    w="64px"
                    borderRadius="none"
                    border="2px solid"
                    borderColor={primaryColor}
                    _hover={{
                      bg: primaryDark,
                      transform: "translateX(2px)",
                    }}
                    _active={{
                      transform: "translateX(0)",
                    }}
                    transition="all 0.2s"
                  />
                </Tooltip>
              </HStack>

              {/* Active Filters Display - Editorial Style */}
              {(activeFiltersCount > 0 || searchQuery.trim()) && (
                <Box
                  w='full'
                  p={4}
                  bg={accentBg}
                  borderWidth="2px"
                  borderColor={borderColor}
                  borderRadius="none"
                >
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between" flexWrap="wrap" gap={2}>
                      <HStack flexWrap='wrap' spacing={2}>
                        <Text
                          fontSize='sm'
                          color={textSecondary}
                          fontWeight='700'
                          textTransform="uppercase"
                          letterSpacing="0.1em"
                        >
                          Active filters:
                        </Text>
                        {Object.entries(filters).map(
                          ([key, value]) =>
                            value && (
                              <Badge
                                key={key}
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
                                {key}: {value}
                              </Badge>
                            )
                        )}
                        {searchQuery.trim() && (
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
                            search: "{searchQuery}"
                          </Badge>
                        )}
                      </HStack>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={clearFilters}
                        borderRadius="none"
                        borderWidth="2px"
                        borderColor={textPrimary}
                        color={textPrimary}
                        fontWeight="700"
                        letterSpacing="0.05em"
                        textTransform="uppercase"
                        fontSize="xs"
                        _hover={{
                          bg: textPrimary,
                          color: "white",
                        }}
                      >
                        Clear all
                      </Button>
                    </HStack>
                    <Divider borderColor={borderColor} />
                    <Text
                      fontSize='sm'
                      color={textSecondary}
                      fontWeight='600'
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                    >
                      Showing {filteredPlayers.length} out of {players.length} players
                    </Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </MotionBox>

          {/* Editorial Divider */}
          {filteredPlayers.length > 0 && (
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

          {/* Players Grid */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={{ base: 6, md: 8 }}
            w={'full'}
          >
            {players.length === 0 ? (
              // Show skeleton cards while loading
              [1, 2, 3, 4, 5, 6].map((i) => (
                <Box
                  key={i}
                  maxW='sm'
                  borderWidth='2px'
                  borderColor={borderColor}
                  borderRadius='none'
                  overflow='hidden'
                  bg={accentBg}
                >
                  <Box p={{ base: 4, md: 6 }} display='flex' justifyContent='center' alignItems='center'>
                    <Box
                      width={{ base: '120px', md: '160px' }}
                      height={{ base: '120px', md: '160px' }}
                      borderRadius='full'
                      bg={bgColor}
                    />
                  </Box>
                  <Box p={{ base: 4, md: 6 }}>
                    <VStack spacing={{ base: 2, md: 3 }} align='start'>
                      <Box w="150px" h="24px" bg={bgColor} borderRadius="sm" />
                      <HStack spacing={{ base: 3, md: 4 }} w='full' align='start' justifyContent='space-between'>
                        <Box>
                          <Box w="60px" h="12px" bg={bgColor} borderRadius="sm" mb={1} />
                          <Box w="80px" h="20px" bg={bgColor} borderRadius="sm" />
                        </Box>
                        <Box>
                          <Box w="70px" h="12px" bg={bgColor} borderRadius="sm" mb={1} />
                          <Box w="90px" h="20px" bg={bgColor} borderRadius="sm" />
                        </Box>
                      </HStack>
                      <Box w="100px" h="20px" bg={bgColor} borderRadius="sm" />
                    </VStack>
                  </Box>
                </Box>
              ))
            ) : (
              filteredPlayers.map((player, index) => (
                <MotionBox
                  key={player._id}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PlayerCard
                    player={player}
                    onPlayerDeleted={handlePlayerDeleted}
                  />
                </MotionBox>
              ))
            )}
          </SimpleGrid>

          {/* Empty State - Editorial Style */}
          {filteredPlayers.length === 0 && players.length > 0 && (
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
                    No Players Found
                  </Heading>
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    color={textSecondary}
                    lineHeight="1.7"
                    fontStyle="italic"
                  >
                    {searchQuery.trim() || activeFiltersCount > 0 ? (
                      <>
                        No players match your search criteria.
                        <br />
                        Try adjusting your search terms or filters.
                      </>
                    ) : (
                      <>
                        No players in the database yet.
                      </>
                    )}
                  </Text>
                  {(searchQuery.trim() || activeFiltersCount > 0) && (
                    <Button
                      onClick={clearFilters}
                      bg={primaryColor}
                      color="white"
                      borderRadius="none"
                      borderWidth="2px"
                      borderColor={primaryColor}
                      fontWeight="700"
                      letterSpacing="0.05em"
                      textTransform="uppercase"
                      px={8}
                      _hover={{
                        bg: primaryDark,
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </VStack>
              </Box>
            </MotionBox>
          )}

          {/* Filter Drawer - Editorial Style */}
          <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
            <DrawerOverlay />
            <DrawerContent bg={bgColor}>
              <DrawerCloseButton
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
              <DrawerHeader
                borderBottomWidth='2px'
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
                    Filter Players
                  </Text>
                </HStack>
              </DrawerHeader>

              <DrawerBody py={8}>
                <VStack spacing={6} align='stretch'>
                  {/* Paddle Filter */}
                  <Box>
                    <Text
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      Paddle
                    </Text>
                    <Select
                      placeholder='All paddles'
                      value={filters.paddle}
                      onChange={e =>
                        setFilters({ ...filters, paddle: e.target.value })
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
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      Paddle Thickness
                    </Text>
                    <Select
                      placeholder='All thicknesses'
                      value={filters.paddleThickness}
                      onChange={e =>
                        setFilters({ ...filters, paddleThickness: e.target.value })
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
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      Paddle Shape
                    </Text>
                    <Select
                      placeholder='All shapes'
                      value={filters.paddleShape}
                      onChange={e =>
                        setFilters({ ...filters, paddleShape: e.target.value })
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
                    >
                      {filterOptions.paddleShape.map(shape => (
                        <option key={shape} value={shape}>
                          {shape}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Divider borderColor={primaryColor} borderWidth="2px" />

                  {/* Shoes Filter */}
                  <Box>
                    <Text
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      Shoe Model
                    </Text>
                    <Select
                      placeholder='All shoes'
                      value={filters.shoeModel}
                      onChange={e =>
                        setFilters({ ...filters, shoeModel: e.target.value })
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
                    >
                      {filterOptions.shoeModel.map(shoe => (
                        <option key={shoe} value={shoe}>
                          {shoe}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Divider borderColor={primaryColor} borderWidth="2px" />

                  {/* Age Range Filter */}
                  <Box>
                    <Text
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      Age Range
                    </Text>
                    <Select
                      placeholder='All ages'
                      value={filters.ageRange}
                      onChange={e =>
                        setFilters({ ...filters, ageRange: e.target.value })
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
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      MLP Team
                    </Text>
                    <Select
                      placeholder='All teams'
                      value={filters.mlpTeam}
                      onChange={e =>
                        setFilters({ ...filters, mlpTeam: e.target.value })
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
                    >
                      {filterOptions.mlpTeam.map(team => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Divider borderColor={primaryColor} borderWidth="2px" />

                  {/* Modifications Filters */}
                  <Box>
                    <Text
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      Overgrips
                    </Text>
                    <Select
                      placeholder='All overgrips'
                      value={filters.overgrips}
                      onChange={e =>
                        setFilters({ ...filters, overgrips: e.target.value })
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
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      Total Weight
                    </Text>
                    <Select
                      placeholder='All total weights'
                      value={filters.totalWeight}
                      onChange={e =>
                        setFilters({ ...filters, totalWeight: e.target.value })
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
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      Weight Info
                    </Text>
                    <Select
                      placeholder='All players'
                      value={filters.weightComplete}
                      onChange={e =>
                        setFilters({ ...filters, weightComplete: e.target.value })
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
                    >
                      <option value='yes'>Known weight setup</option>
                      <option value='no'>Unknown weight setup</option>
                    </Select>
                  </Box>

                  <Box>
                    <Text
                      fontWeight='700'
                      mb={3}
                      fontSize="sm"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color={textPrimary}
                    >
                      Sponsor
                    </Text>
                    <Select
                      placeholder='All sponsors'
                      value={filters.sponsor}
                      onChange={e =>
                        setFilters({ ...filters, sponsor: e.target.value })
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
                    >
                      {filterOptions.sponsor.map(sponsor => (
                        <option key={sponsor} value={sponsor}>
                          {sponsor}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Divider borderColor={primaryColor} borderWidth="2px" />

                  {/* Action Buttons */}
                  <HStack spacing={4} pt={2}>
                    <Button
                      bg={primaryColor}
                      color="white"
                      onClick={onClose}
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
                      Apply Filters
                    </Button>
                    <Button
                      variant='outline'
                      onClick={clearFilters}
                      flex={1}
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
                      Clear All
                    </Button>
                  </HStack>
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </MotionVStack>
      </Container>
    </Box>
  );
};

export default Players;
