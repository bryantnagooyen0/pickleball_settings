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
import React, { useState, useMemo } from 'react';
import { usePlayerStore } from '../store/player';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import { SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { FaUsers } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';

const LandingPage = () => {
  const { fetchPlayers, players } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Color mode values
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.400, purple.500)',
    'linear(to-r, blue.600, purple.600)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

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

  // Get unique sponsors for stats
  const uniqueSponsors = useMemo(() => {
    return [...new Set(players.map(p => p.sponsor).filter(Boolean))].length;
  }, [players]);

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to players page with search query as URL parameter
      navigate(`/players?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // If no search query, just go to players page
      navigate('/players');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgGradient={bgGradient}
        color="white"
        py={20}
        px={6}
        textAlign="center"
      >
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Heading
              as="h1"
              size="4xl"
              fontWeight="bold"
              textShadow="2px 2px 4px rgba(0,0,0,0.3)"
            >
              Pickleball Settings
            </Heading>
            <Text fontSize="xl" maxW="2xl" opacity={0.9}>
              Discover the equipment, settings, and gear used by professional pickleball players. 
              Find your perfect setup and elevate your game.
            </Text>
            
            {/* Search Bar */}
            <Box w="full" maxW="600px" as="form" onSubmit={handleSearch}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search players by name or sponsor..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  bg="white"
                  color="black"
                  _placeholder={{ color: "gray.500" }}
                  _focus={{
                    borderColor: "white",
                    boxShadow: "0 0 0 1px white",
                  }}
                />
              </InputGroup>
            </Box>

            <HStack spacing={4}>
              <Link to="/players">
                <Button size="lg" colorScheme="white" variant="outline" rightIcon={<ArrowForwardIcon />}>
                  Browse Players
                </Button>
              </Link>
              <Link to="/paddles">
                <Button size="lg" colorScheme="white" variant="outline" rightIcon={<ArrowForwardIcon />}>
                  Explore Paddles
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={16}>
        {/* Statistics Section */}
        <VStack spacing={12}>
          <Heading as="h2" size="2xl" textAlign="center">
            Platform Statistics
          </Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={8} w="full">
            <GridItem>
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Total Players</StatLabel>
                    <StatNumber color="blue.500">{players.length}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Professional players
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem>
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Paddle Brands</StatLabel>
                    <StatNumber color="green.500">{uniquePaddles}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Different brands
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem>
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Sponsors</StatLabel>
                    <StatNumber color="purple.500">{uniqueSponsors}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Active sponsors
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem>
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Equipment Sets</StatLabel>
                    <StatNumber color="orange.500">{players.length}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Complete setups
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Category Cards */}
          <VStack spacing={8} w="full">
            <Heading as="h2" size="2xl" textAlign="center">
              Explore Categories
            </Heading>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} w="full">
              <GridItem>
                <Link to="/players">
                  <Card 
                    bg={cardBg} 
                    borderColor={borderColor} 
                    borderWidth="1px"
                    _hover={{ 
                      transform: "translateY(-4px)", 
                      boxShadow: "lg",
                      borderColor: "blue.300"
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                  >
                    <CardBody textAlign="center" pt={4} pb={8} px={8}>
                      <Box mb={4}>
                        <MdPerson size={48} color="#3182ce" />
                      </Box>
                      <Heading size="lg" mb={2}>Players</Heading>
                      <Text color="gray.600">
                        Browse professional pickleball players and their equipment setups
                      </Text>
                    </CardBody>
                  </Card>
                </Link>
              </GridItem>
              
              <GridItem>
                <Link to="/paddles">
                  <Card 
                    bg={cardBg} 
                    borderColor={borderColor} 
                    borderWidth="1px"
                    _hover={{ 
                      transform: "translateY(-4px)", 
                      boxShadow: "lg",
                      borderColor: "green.300"
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                  >
                    <CardBody textAlign="center" pt={4} pb={8} px={8}>
                      <Box mb={4}>
                        <Image
                          src="/new_paddleicon.png"
                          alt="Paddles"
                          width="48px"
                          height="48px"
                          objectFit="contain"
                          transform="scale(1.2)"
                        />
                      </Box>
                      <Heading size="lg" mb={2}>Paddles</Heading>
                      <Text color="gray.600">
                        Discover the latest paddle models and specifications
                      </Text>
                    </CardBody>
                  </Card>
                </Link>
              </GridItem>
              
              <GridItem>
                <Card 
                  bg={cardBg} 
                  borderColor={borderColor} 
                  borderWidth="1px"
                  _hover={{ 
                    transform: "translateY(-4px)", 
                    boxShadow: "lg",
                    borderColor: "purple.300"
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <CardBody textAlign="center" pt={4} pb={8} px={8}>
                    <Box mb={4}>
                      <FaUsers size={48} color="#805ad5" />
                    </Box>
                    <Heading size="lg" mb={2}>Community Setups</Heading>
                    <Text color="gray.600">
                      Coming soon - Share your setup and discover how other users are playing
                    </Text>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </VStack>

          {/* Featured Players Section */}
          {featuredPlayers.length > 0 && (
            <VStack spacing={8} w="full">
              <HStack justify="space-between" w="full">
                <Heading as="h2" size="2xl">
                  Featured Players
                </Heading>
                <Link to="/players">
                  <Button rightIcon={<ArrowForwardIcon />} variant="outline">
                    View All Players
                  </Button>
                </Link>
              </HStack>
              
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={6}
                w="full"
              >
                {featuredPlayers.map(player => (
                  <PlayerCard
                    key={player._id}
                    player={player}
                    onPlayerDeleted={() => fetchPlayers()}
                  />
                ))}
              </SimpleGrid>
            </VStack>
          )}

          {/* Recent Players Section */}
          {recentPlayers.length > 0 && (
            <VStack spacing={8} w="full">
              <HStack justify="space-between" w="full">
                <Heading as="h2" size="2xl">
                  Recently Added
                </Heading>
                <Link to="/players">
                  <Button rightIcon={<ArrowForwardIcon />} variant="outline">
                    View All Players
                  </Button>
                </Link>
              </HStack>
              
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 4 }}
                spacing={6}
                w="full"
              >
                {recentPlayers.map(player => (
                  <PlayerCard
                    key={player._id}
                    player={player}
                    onPlayerDeleted={() => fetchPlayers()}
                  />
                ))}
              </SimpleGrid>
            </VStack>
          )}

          {/* Call to Action */}
          <Box
            bgGradient="linear(to-r, blue.50, purple.50)"
            p={12}
            borderRadius="xl"
            textAlign="center"
            w="full"
          >
            <VStack spacing={6}>
              <Heading as="h2" size="xl">
                Ready to Find Your Perfect Setup?
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Browse through professional player configurations to find the equipment 
                that matches your playing style and preferences.
              </Text>
              <HStack spacing={4}>
                <Link to="/players">
                  <Button size="lg" colorScheme="blue" rightIcon={<ArrowForwardIcon />}>
                    Start Browsing
                  </Button>
                </Link>
                <Link to="/paddles">
                  <Button size="lg" variant="outline" rightIcon={<ArrowForwardIcon />}>
                    Explore Paddles
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage;
