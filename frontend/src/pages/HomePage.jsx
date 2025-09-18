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
} from '@chakra-ui/react';
import React, { useState, useMemo } from 'react';
import { usePlayerStore } from '../store/player';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import { SearchIcon } from '@chakra-ui/icons';
import { FaFilter } from 'react-icons/fa';

const HomePage = () => {
  const { fetchPlayers, players } = usePlayerStore();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
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
      currentLocation: '',
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
      currentLocation: [
        ...new Set(players.map(p => p.currentLocation).filter(Boolean)),
      ],
      overgrips: [...new Set(players.map(p => p.overgrips).filter(Boolean))],
      totalWeight: [...new Set(players.map(p => p.totalWeight).filter(Boolean))],
      sponsor: [...new Set(players.map(p => p.sponsor).filter(Boolean))],
    };
    return options;
  }, [players]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

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


  console.log('players', players);

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

  // Scroll position restoration
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('playerListScrollPosition');
    if (savedScrollPosition && filteredPlayers.length > 0) {
      // Use requestAnimationFrame to ensure the DOM is fully rendered
      const restoreScroll = () => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        // Clear the saved position after restoring
        sessionStorage.removeItem('playerListScrollPosition');
      };
      
      // Double requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(restoreScroll);
      });
    }
  }, [filteredPlayers]); // Restore when filtered players change

  // Don't automatically save scroll position - only save when clicking on a player

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
      currentLocation: '',
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
    <Container maxW='container.xl' py={12}>
      <VStack spacing={8}>
        <Text
          fontSize={'30'}
          fontWeight={'bold'}
          bgGradient={'linear(to-r, cyan.400, blue.500)'}
          bgClip={'text'}
          textAlign={'center'}
        >
          Player List
        </Text>

        {/* Search and Filter Bar */}
        <VStack w='full' spacing={4}>
          <HStack w='full' spacing={4}>
            <Box flex={1}>
              <InputGroup>
                <InputLeftElement pointerEvents='none'>
                  <SearchIcon color='gray.400' />
                </InputLeftElement>
                <Input
                  placeholder='Search players by name or sponsor...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  size='lg'
                  bg='white'
                  border='2px'
                  borderColor='gray.200'
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px blue.500',
                  }}
                  _hover={{
                    borderColor: 'gray.300',
                  }}
                />
              </InputGroup>
            </Box>

            <Tooltip label='Filter Players' placement='top'>
              <IconButton
                icon={<FaFilter />}
                onClick={onOpen}
                size='lg'
                colorScheme={activeFiltersCount > 0 ? 'blue' : 'gray'}
                aria-label='Filter players'
                position='relative'
              />
            </Tooltip>
          </HStack>

          {/* Active Filters Display */}
          {(activeFiltersCount > 0 || searchQuery.trim()) && (
            <HStack w='full' flexWrap='wrap' spacing={2}>
              <Text fontSize='sm' color='gray.600' fontWeight='medium'>
                Active filters:
              </Text>
              {Object.entries(filters).map(
                ([key, value]) =>
                  value && (
                    <Badge key={key} colorScheme='blue' variant='subtle'>
                      {key}: {value}
                    </Badge>
                  )
              )}
              {searchQuery.trim() && (
                <Badge colorScheme='green' variant='subtle'>
                  search: "{searchQuery}"
                </Badge>
              )}
              <Button size='xs' variant='ghost' onClick={clearFilters}>
                Clear all
              </Button>
              <Text fontSize='sm' color='gray.600' fontWeight='medium' ml={4}>
                Showing {filteredPlayers.length} out of {players.length} players
              </Text>
            </HStack>
          )}
        </VStack>

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            lg: 3,
          }}
          spacing={10}
          w={'full'}
        >
          {filteredPlayers.map(player => (
            <PlayerCard
              key={player._id}
              player={player}
              onPlayerDeleted={handlePlayerDeleted}
            />
          ))}
        </SimpleGrid>

        {filteredPlayers.length === 0 && (
          <Text
            fontSize='xl'
            textAlign={'center'}
            fontWeight='bold'
            color='gray.500'
          >
            {searchQuery.trim() || activeFiltersCount > 0 ? (
              <>
                No players found matching your criteria
                <br />
                <Text fontSize='md' mt={2}>
                  Try adjusting your search terms or filters
                </Text>
              </>
            ) : (
              <>
                No player found 😢{' '}
                <Link to={'/create'}>
                  <Text
                    as='span'
                    color='blue.500'
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Create a player
                  </Text>
                </Link>
              </>
            )}
          </Text>
        )}
      </VStack>

      {/* Filter Drawer */}
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>Filter Players</DrawerHeader>

          <DrawerBody>
            <VStack spacing={6} align='stretch'>
              {/* Paddle Filter */}
              <Box>
                <Text fontWeight='bold' mb={2}>
                  Paddle
                </Text>
                <Select
                  placeholder='All paddles'
                  value={filters.paddle}
                  onChange={e =>
                    setFilters({ ...filters, paddle: e.target.value })
                  }
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
                <Text fontWeight='bold' mb={2}>
                  Paddle Thickness
                </Text>
                <Select
                  placeholder='All thicknesses'
                  value={filters.paddleThickness}
                  onChange={e =>
                    setFilters({ ...filters, paddleThickness: e.target.value })
                  }
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
                <Text fontWeight='bold' mb={2}>
                  Paddle Shape
                </Text>
                <Select
                  placeholder='All shapes'
                  value={filters.paddleShape}
                  onChange={e =>
                    setFilters({ ...filters, paddleShape: e.target.value })
                  }
                >
                  {filterOptions.paddleShape.map(shape => (
                    <option key={shape} value={shape}>
                      {shape}
                    </option>
                  ))}
                </Select>
              </Box>

              <Divider />

              {/* Shoes Filter */}
              <Box>
                <Text fontWeight='bold' mb={2}>
                  Shoe Model
                </Text>
                <Select
                  placeholder='All shoes'
                  value={filters.shoeModel}
                  onChange={e =>
                    setFilters({ ...filters, shoeModel: e.target.value })
                  }
                >
                  {filterOptions.shoeModel.map(shoe => (
                    <option key={shoe} value={shoe}>
                      {shoe}
                    </option>
                  ))}
                </Select>
              </Box>

              <Divider />

              {/* Age Range Filter */}
              <Box>
                <Text fontWeight='bold' mb={2}>
                  Age Range
                </Text>
                <Select
                  placeholder='All ages'
                  value={filters.ageRange}
                  onChange={e =>
                    setFilters({ ...filters, ageRange: e.target.value })
                  }
                >
                  <option value='18-25'>18-25</option>
                  <option value='26-35'>26-35</option>
                  <option value='36-45'>36-45</option>
                  <option value='46+'>46+</option>
                </Select>
              </Box>

              {/* MLP Team Filter */}
              <Box>
                <Text fontWeight='bold' mb={2}>
                  MLP Team
                </Text>
                <Select
                  placeholder='All teams'
                  value={filters.mlpTeam}
                  onChange={e =>
                    setFilters({ ...filters, mlpTeam: e.target.value })
                  }
                >
                  {filterOptions.mlpTeam.map(team => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Location Filter */}
              <Box>
                <Text fontWeight='bold' mb={2}>
                  Location
                </Text>
                <Select
                  placeholder='All locations'
                  value={filters.currentLocation}
                  onChange={e =>
                    setFilters({ ...filters, currentLocation: e.target.value })
                  }
                >
                  {filterOptions.currentLocation.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </Select>
              </Box>

              <Divider />

              {/* Modifications Filters */}
              <Box>
                <Text fontWeight='bold' mb={2}>
                  Overgrips
                </Text>
                <Select
                  placeholder='All overgrips'
                  value={filters.overgrips}
                  onChange={e =>
                    setFilters({ ...filters, overgrips: e.target.value })
                  }
                >
                  {filterOptions.overgrips.map(overgrip => (
                    <option key={overgrip} value={overgrip}>
                      {overgrip}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontWeight='bold' mb={2}>
                  Total Weight
                </Text>
                <Select
                  placeholder='All total weights'
                  value={filters.totalWeight}
                  onChange={e =>
                    setFilters({ ...filters, totalWeight: e.target.value })
                  }
                >
                  {filterOptions.totalWeight.map(totalWeight => (
                    <option key={totalWeight} value={totalWeight}>
                      {totalWeight}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontWeight='bold' mb={2}>
                  Weight Info
                </Text>
                <Select
                  placeholder='All players'
                  value={filters.weightComplete}
                  onChange={e =>
                    setFilters({ ...filters, weightComplete: e.target.value })
                  }
                >
                  <option value='yes'>Known weight setup</option>
                  <option value='no'>Unknown weight setup</option>
                </Select>
              </Box>

              <Box>
                <Text fontWeight='bold' mb={2}>
                  Sponsor
                </Text>
                <Select
                  placeholder='All sponsors'
                  value={filters.sponsor}
                  onChange={e =>
                    setFilters({ ...filters, sponsor: e.target.value })
                  }
                >
                  {filterOptions.sponsor.map(sponsor => (
                    <option key={sponsor} value={sponsor}>
                      {sponsor}
                    </option>
                  ))}
                </Select>
              </Box>

              <Divider />

              {/* Action Buttons */}
              <HStack spacing={4}>
                <Button colorScheme='blue' onClick={onClose} flex={1}>
                  Apply Filters
                </Button>
                <Button variant='outline' onClick={clearFilters} flex={1}>
                  Clear All
                </Button>
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default HomePage;
