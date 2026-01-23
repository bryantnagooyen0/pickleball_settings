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
  Grid,
  GridItem,
  useColorModeValue,
  Image,
  Flex,
  Icon,
  Divider,
  Stack,
} from '@chakra-ui/react';
import React, { useState, useMemo } from 'react';
import { usePlayerStore } from '../store/player';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import { SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { FaUsers, FaTrophy, FaChartLine } from 'react-icons/fa';
import { MdPerson, MdSportsTennis } from 'react-icons/md';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionVStack = motion(VStack);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);

const LandingPage = () => {
  const { fetchPlayers, players } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Editorial color palette
  const bgColor = '#FAF7ED';
  const primaryColor = '#AE573E';
  const primaryDark = '#8B4532';
  const textPrimary = '#161412';
  const textSecondary = '#6B7280';
  const accentBg = '#F5F1E3';
  const borderColor = '#E5E7EB';

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    window.scrollTo(0, 0);
    sessionStorage.removeItem('restorePlayerListScroll');
    sessionStorage.removeItem('playerListScrollPosition');
    sessionStorage.removeItem('restorePaddleListScroll');
    sessionStorage.removeItem('paddleListScrollPosition');
  }, []);

  const featuredPlayers = useMemo(() => {
    return players.slice(0, 6);
  }, [players]);

  const recentPlayers = useMemo(() => {
    return players.slice(-4).reverse();
  }, [players]);

  const uniquePaddles = useMemo(() => {
    return [...new Set(players.map(p => p.paddle).filter(Boolean))].length;
  }, [players]);

  const uniqueSponsors = useMemo(() => {
    return [...new Set(players.map(p => p.sponsor).filter(Boolean))].length;
  }, [players]);

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

  // Editorial animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section - Editorial Style */}
      <Box
        position="relative"
        overflow="hidden"
        bg={bgColor}
        pt={{ base: 24, md: 40 }}
        pb={{ base: 20, md: 32 }}
        px={6}
      >
        {/* Editorial background elements */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="1px"
          bg={primaryColor}
          opacity={0.3}
        />
        <Box
          position="absolute"
          top="20%"
          right="-15%"
          w="800px"
          h="800px"
          borderRadius="full"
          bg={`${primaryColor}05`}
          filter="blur(100px)"
          zIndex={0}
        />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1.2fr 0.8fr" }}
            gap={{ base: 12, lg: 20 }}
            alignItems="center"
          >
            {/* Left Column - Main Content */}
            <MotionVStack
              spacing={8}
              align="stretch"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Editorial Label */}
              <MotionBox variants={fadeInUp}>
                <HStack spacing={3} mb={2}>
                  <Box w="40px" h="2px" bg={primaryColor} />
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color={primaryColor}
                    letterSpacing="0.2em"
                    textTransform="uppercase"
                  >
                    Equipment Database
                  </Text>
                </HStack>
              </MotionBox>

              {/* Main Headline - Editorial Style */}
              <MotionBox variants={fadeInUp}>
                <Heading
                  as="h1"
                  fontSize={{ base: "5xl", md: "6xl", lg: "8xl" }}
                  fontWeight="900"
                  color={textPrimary}
                  letterSpacing="-0.05em"
                  lineHeight="0.95"
                  mb={6}
                >
                  Inside the
                  <Box as="span" display="block" color={primaryColor} mt={2}>
                    Pro's Bag
                  </Box>
                </Heading>
              </MotionBox>

              {/* Editorial Subhead */}
              <MotionBox variants={fadeInUp}>
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  color={textSecondary}
                  fontWeight="400"
                  lineHeight="1.7"
                  maxW="2xl"
                  fontStyle="italic"
                >
                  The definitive guide to what professional pickleball players 
                  actually use. Every paddle. Every grip. Every detail.
                </Text>
              </MotionBox>

              {/* Search Bar - Editorial Style */}
              <MotionBox
                variants={fadeInUp}
                as="form"
                onSubmit={handleSearch}
                maxW="2xl"
                pt={4}
              >
                <InputGroup size="lg">
                  <InputLeftElement
                    pointerEvents="none"
                    h="full"
                    pl={6}
                    children={<SearchIcon color={textSecondary} boxSize={5} />}
                  />
                  <Input
                    placeholder="Search players, equipment, sponsors..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
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
              </MotionBox>

              {/* CTA Buttons - Editorial Style */}
              <MotionBox variants={fadeInUp} pt={2}>
                <HStack spacing={6} flexWrap="wrap">
                  <Link to="/players">
                    <Button
                      size="lg"
                      bg={primaryColor}
                      color="white"
                      _hover={{
                        bg: primaryDark,
                        transform: "translateX(4px)",
                      }}
                      _active={{
                        transform: "translateX(0)",
                      }}
                      rightIcon={<ArrowForwardIcon />}
                      px={10}
                      py={7}
                      fontSize="md"
                      fontWeight="700"
                      borderRadius="none"
                      transition="all 0.2s"
                      letterSpacing="0.05em"
                      textTransform="uppercase"
                      border="2px solid"
                      borderColor={primaryColor}
                    >
                      Browse Players
                    </Button>
                  </Link>
                  <Link to="/paddles">
                    <Button
                      size="lg"
                      variant="outline"
                      borderWidth="2px"
                      borderColor={textPrimary}
                      color={textPrimary}
                      bg="transparent"
                      _hover={{
                        bg: textPrimary,
                        color: "white",
                        transform: "translateX(4px)",
                      }}
                      _active={{
                        transform: "translateX(0)",
                      }}
                      rightIcon={<ArrowForwardIcon />}
                      px={10}
                      py={7}
                      fontSize="md"
                      fontWeight="700"
                      borderRadius="none"
                      transition="all 0.2s"
                      letterSpacing="0.05em"
                      textTransform="uppercase"
                    >
                      Explore Paddles
                    </Button>
                  </Link>
                </HStack>
              </MotionBox>
            </MotionVStack>

            {/* Right Column - Stats Preview (Editorial Style) */}
            <MotionBox
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              display={{ base: "none", lg: "block" }}
            >
              <VStack spacing={8} align="stretch" pl={8} borderLeft="2px solid" borderColor={primaryColor}>
                {[
                  { label: "Players", value: players.length, color: primaryColor },
                  { label: "Paddle Brands", value: uniquePaddles, color: textPrimary },
                  { label: "Sponsors", value: uniqueSponsors, color: textPrimary },
                ].map((stat, index) => (
                  <Box key={index}>
                    <Text
                      fontSize="6xl"
                      fontWeight="900"
                      color={stat.color}
                      lineHeight="1"
                      letterSpacing="-0.03em"
                    >
                      {stat.value}
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color={textSecondary}
                      textTransform="uppercase"
                      letterSpacing="0.15em"
                      mt={2}
                    >
                      {stat.label}
                    </Text>
                    {index < 2 && <Divider borderColor={borderColor} mt={6} />}
                  </Box>
                ))}
              </VStack>
            </MotionBox>
          </Grid>
        </Container>
      </Box>

      {/* Editorial Divider */}
      <Box bg={bgColor} py={4} px={6}>
        <Container maxW="container.xl">
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
              Featured
            </Text>
            <Box flex="1" h="2px" bg={primaryColor} />
          </HStack>
        </Container>
      </Box>

      {/* Statistics Section - Editorial Grid */}
      <Box bg={accentBg} py={{ base: 20, md: 32 }} px={6}>
        <Container maxW="container.xl">
          <MotionVStack
            spacing={16}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <MotionBox variants={fadeInUp}>
              <HStack spacing={4} mb={6}>
                <Box w="60px" h="3px" bg={primaryColor} />
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color={primaryColor}
                  letterSpacing="0.2em"
                  textTransform="uppercase"
                >
                  By The Numbers
                </Text>
              </HStack>
              <Heading
                as="h2"
                fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                color={textPrimary}
                fontWeight="900"
                letterSpacing="-0.04em"
                lineHeight="1"
              >
                Platform
                <Box as="span" display="block" color={primaryColor} mt={2}>
                  Statistics
                </Box>
              </Heading>
            </MotionBox>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
              gap={8}
              w="full"
            >
              {[
                {
                  label: "Total Players",
                  value: players.length,
                  icon: MdPerson,
                },
                {
                  label: "Paddle Brands",
                  value: uniquePaddles,
                  icon: MdSportsTennis,
                },
                {
                  label: "Sponsors",
                  value: uniqueSponsors,
                  icon: FaTrophy,
                },
                {
                  label: "Equipment Sets",
                  value: players.length,
                  icon: FaChartLine,
                },
              ].map((stat, index) => (
                <GridItem key={index}>
                  <MotionCard
                    variants={fadeInUp}
                    bg={bgColor}
                    borderWidth="2px"
                    borderColor={borderColor}
                    borderRadius="none"
                    overflow="hidden"
                    _hover={{
                      borderColor: primaryColor,
                      transform: "translateY(-4px)",
                    }}
                    transition="all 0.3s"
                    h="full"
                    position="relative"
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      w="4px"
                      h="full"
                      bg={primaryColor}
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                    />
                    <CardBody p={8}>
                      <VStack spacing={6} align="stretch">
                        <Icon as={stat.icon} boxSize={10} color={primaryColor} />
                        <Stat>
                          <StatNumber
                            fontSize={{ base: "5xl", md: "6xl" }}
                            fontWeight="900"
                            color={textPrimary}
                            lineHeight="1"
                            letterSpacing="-0.03em"
                            mb={2}
                          >
                            {stat.value}
                          </StatNumber>
                          <StatLabel
                            fontSize="sm"
                            fontWeight="600"
                            color={textSecondary}
                            textTransform="uppercase"
                            letterSpacing="0.15em"
                          >
                            {stat.label}
                          </StatLabel>
                        </Stat>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </GridItem>
              ))}
            </Grid>
          </MotionVStack>
        </Container>
      </Box>

      {/* Editorial Divider */}
      <Box bg={bgColor} py={4} px={6}>
        <Container maxW="container.xl">
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
              Explore
            </Text>
            <Box flex="1" h="2px" bg={primaryColor} />
          </HStack>
        </Container>
      </Box>

      {/* Category Section - Editorial Layout */}
      <Box bg={bgColor} py={{ base: 20, md: 32 }} px={6}>
        <Container maxW="container.xl">
          <MotionVStack
            spacing={16}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <MotionBox variants={fadeInUp}>
              <HStack spacing={4} mb={6}>
                <Box w="60px" h="3px" bg={primaryColor} />
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color={primaryColor}
                  letterSpacing="0.2em"
                  textTransform="uppercase"
                >
                  Categories
                </Text>
              </HStack>
              <Heading
                as="h2"
                fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                color={textPrimary}
                fontWeight="900"
                letterSpacing="-0.04em"
                lineHeight="1"
              >
                Discover
                <Box as="span" display="block" color={primaryColor} mt={2}>
                  Everything
                </Box>
              </Heading>
            </MotionBox>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
              gap={8}
              w="full"
            >
              {[
                {
                  title: "Players",
                  description: "Browse professional players and their complete equipment configurations. See what the pros are really using.",
                  icon: MdPerson,
                  link: "/players",
                },
                {
                  title: "Paddles",
                  description: "Discover paddle models, specifications, and see which professional players prefer each brand.",
                  icon: MdSportsTennis,
                  link: "/paddles",
                },
                {
                  title: "Community",
                  description: "Coming soon. Share your setup and connect with other players in the pickleball community.",
                  icon: FaUsers,
                  link: null,
                },
              ].map((category, index) => {
                const CardContent = (
                  <MotionCard
                    variants={fadeInUp}
                    bg={accentBg}
                    borderWidth="2px"
                    borderColor={borderColor}
                    borderRadius="none"
                    overflow="hidden"
                    _hover={{
                      borderColor: primaryColor,
                      transform: "translateY(-6px)",
                    }}
                    transition="all 0.3s"
                    cursor={category.link ? "pointer" : "default"}
                    h="full"
                    position="relative"
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      w="4px"
                      h="full"
                      bg={primaryColor}
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                    />
                    <CardBody p={10}>
                      <VStack spacing={6} align="stretch" h="full">
                        <Box
                          display="inline-flex"
                          p={4}
                          bg={primaryColor}
                          borderRadius="none"
                          w="fit-content"
                        >
                          {category.title === "Paddles" ? (
                            <Image
                              src="/new_paddleicon.png"
                              alt="Paddles"
                              width="32px"
                              height="32px"
                              objectFit="contain"
                              filter="brightness(0) invert(1)"
                            />
                          ) : (
                            <Icon as={category.icon} boxSize={8} color="white" />
                          )}
                        </Box>
                        <VStack spacing={4} align="stretch" flex="1">
                          <Heading
                            size="xl"
                            color={textPrimary}
                            fontWeight="900"
                            letterSpacing="-0.02em"
                            fontSize="3xl"
                          >
                            {category.title}
                          </Heading>
                          <Text
                            color={textSecondary}
                            fontSize="md"
                            lineHeight="1.8"
                            flex="1"
                          >
                            {category.description}
                          </Text>
                        </VStack>
                        {category.link && (
                          <HStack
                            color={primaryColor}
                            fontWeight="700"
                            fontSize="sm"
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            spacing={2}
                            _hover={{ transform: "translateX(4px)" }}
                            transition="transform 0.2s"
                          >
                            <Text>Explore</Text>
                            <ArrowForwardIcon />
                          </HStack>
                        )}
                      </VStack>
                    </CardBody>
                  </MotionCard>
                );

                return (
                  <GridItem key={index}>
                    {category.link ? (
                      <Link to={category.link} style={{ display: 'block', height: '100%' }}>
                        {CardContent}
                      </Link>
                    ) : (
                      CardContent
                    )}
                  </GridItem>
                );
              })}
            </Grid>
          </MotionVStack>
        </Container>
      </Box>

      {/* Editorial Divider */}
      <Box bg={accentBg} py={4} px={6}>
        <Container maxW="container.xl">
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
              Featured Players
            </Text>
            <Box flex="1" h="2px" bg={primaryColor} />
          </HStack>
        </Container>
      </Box>

      {/* Featured Players Section */}
      {featuredPlayers.length > 0 && (
        <Box bg={accentBg} py={{ base: 20, md: 32 }} px={6}>
          <Container maxW="container.xl">
            <MotionVStack
              spacing={12}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <MotionFlex
                variants={fadeInUp}
                justify="space-between"
                align="flex-end"
                flexDir={{ base: "column", md: "row" }}
                gap={6}
                w="full"
              >
                <Box>
                  <HStack spacing={4} mb={6}>
                    <Box w="60px" h="3px" bg={primaryColor} />
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color={primaryColor}
                      letterSpacing="0.2em"
                      textTransform="uppercase"
                    >
                      Top Players
                    </Text>
                  </HStack>
                  <Heading
                    as="h2"
                    fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                    color={textPrimary}
                    fontWeight="900"
                    letterSpacing="-0.04em"
                    lineHeight="1"
                  >
                    Featured
                    <Box as="span" display="block" color={primaryColor} mt={2}>
                      Professionals
                    </Box>
                  </Heading>
                </Box>
                <Link to="/players">
                  <Button
                    variant="outline"
                    borderWidth="2px"
                    borderColor={textPrimary}
                    color={textPrimary}
                    bg="transparent"
                    _hover={{
                      bg: textPrimary,
                      color: "white",
                    }}
                    rightIcon={<ArrowForwardIcon />}
                    borderRadius="none"
                    px={8}
                    fontWeight="700"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                    fontSize="sm"
                  >
                    View All
                  </Button>
                </Link>
              </MotionFlex>

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
                      borderWidth="2px"
                      borderRadius="none"
                      overflow="hidden"
                      bg={bgColor}
                      borderColor={borderColor}
                    >
                      <Box
                        p={{ base: 4, md: 6 }}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Box
                          width={{ base: "120px", md: "160px" }}
                          height={{ base: "120px", md: "160px" }}
                          borderRadius="full"
                          bg={accentBg}
                        />
                      </Box>
                      <Box p={{ base: 4, md: 6 }}>
                        <VStack spacing={{ base: 2, md: 3 }} align="start">
                          <Box w="150px" h="24px" bg={accentBg} borderRadius="sm" />
                          <HStack
                            spacing={{ base: 3, md: 4 }}
                            w="full"
                            align="start"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Box w="60px" h="12px" bg={accentBg} borderRadius="sm" mb={1} />
                              <Box w="80px" h="20px" bg={accentBg} borderRadius="sm" />
                            </Box>
                            <Box>
                              <Box w="70px" h="12px" bg={accentBg} borderRadius="sm" mb={1} />
                              <Box w="90px" h="20px" bg={accentBg} borderRadius="sm" />
                            </Box>
                          </HStack>
                          <Box w="100px" h="20px" bg={accentBg} borderRadius="sm" />
                        </VStack>
                      </Box>
                    </Box>
                  ))
                ) : (
                  featuredPlayers.map((player, index) => (
                    <MotionBox
                      key={player._id}
                      variants={fadeInUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PlayerCard
                        player={player}
                        onPlayerDeleted={() => fetchPlayers()}
                      />
                    </MotionBox>
                  ))
                )}
              </SimpleGrid>
            </MotionVStack>
          </Container>
        </Box>
      )}

      {/* Recent Players Section */}
      {recentPlayers.length > 0 && (
        <Box bg={bgColor} py={{ base: 20, md: 32 }} px={6}>
          <Container maxW="container.xl">
            <MotionVStack
              spacing={12}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
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
                    Latest Additions
                  </Text>
                </HStack>
                <Heading
                  as="h2"
                  fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                  color={textPrimary}
                  fontWeight="900"
                  letterSpacing="-0.04em"
                  lineHeight="1"
                >
                  Recently
                  <Box as="span" display="block" color={primaryColor} mt={2}>
                    Added
                  </Box>
                </Heading>
              </MotionBox>

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
                      borderWidth="2px"
                      borderRadius="none"
                      overflow="hidden"
                      bg={accentBg}
                      borderColor={borderColor}
                    >
                      <Box
                        p={{ base: 4, md: 6 }}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Box
                          width={{ base: "120px", md: "160px" }}
                          height={{ base: "120px", md: "160px" }}
                          borderRadius="full"
                          bg={bgColor}
                        />
                      </Box>
                      <Box p={{ base: 4, md: 6 }}>
                        <VStack spacing={{ base: 2, md: 3 }} align="start">
                          <Box w="150px" h="24px" bg={bgColor} borderRadius="sm" />
                          <HStack
                            spacing={{ base: 3, md: 4 }}
                            w="full"
                            align="start"
                            justifyContent="space-between"
                          >
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
                  recentPlayers.map((player, index) => (
                    <MotionBox
                      key={player._id}
                      variants={fadeInUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PlayerCard
                        player={player}
                        onPlayerDeleted={() => fetchPlayers()}
                      />
                    </MotionBox>
                  ))
                )}
              </SimpleGrid>
            </MotionVStack>
          </Container>
        </Box>
      )}

      {/* Final CTA Section - Editorial Style */}
      <Box bg={accentBg} py={{ base: 24, md: 40 }} px={6} position="relative">
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          bg={primaryColor}
        />
        <Container maxW="container.xl">
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <VStack spacing={12} textAlign="center" maxW="4xl" mx="auto">
              <Box>
                <HStack spacing={4} justify="center" mb={6}>
                  <Box w="60px" h="3px" bg={primaryColor} />
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color={primaryColor}
                    letterSpacing="0.2em"
                    textTransform="uppercase"
                  >
                    Get Started
                  </Text>
                  <Box w="60px" h="3px" bg={primaryColor} />
                </HStack>
                <Heading
                  as="h2"
                  fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }}
                  color={textPrimary}
                  fontWeight="900"
                  letterSpacing="-0.05em"
                  lineHeight="1"
                >
                  Find Your
                  <Box as="span" display="block" color={primaryColor} mt={2}>
                    Perfect Setup
                  </Box>
                </Heading>
              </Box>
              <Text
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                color={textSecondary}
                maxW="2xl"
                mx="auto"
                lineHeight="1.7"
                fontStyle="italic"
              >
                Browse professional player configurations and discover the equipment 
                that matches your playing style and preferences.
              </Text>
              <HStack spacing={6} flexWrap="wrap" justify="center" pt={4}>
                <Link to="/players">
                  <Button
                    size="lg"
                    bg={primaryColor}
                    color="white"
                    _hover={{
                      bg: primaryDark,
                      transform: "translateX(4px)",
                    }}
                    _active={{
                      transform: "translateX(0)",
                    }}
                    rightIcon={<ArrowForwardIcon />}
                    px={12}
                    py={8}
                    fontSize="md"
                    fontWeight="700"
                    borderRadius="none"
                    transition="all 0.2s"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                    border="2px solid"
                    borderColor={primaryColor}
                  >
                    Start Browsing
                  </Button>
                </Link>
                <Link to="/paddles">
                  <Button
                    size="lg"
                    variant="outline"
                    borderWidth="2px"
                    borderColor={textPrimary}
                    color={textPrimary}
                    bg="transparent"
                    _hover={{
                      bg: textPrimary,
                      color: "white",
                      transform: "translateX(4px)",
                    }}
                    _active={{
                      transform: "translateX(0)",
                    }}
                    rightIcon={<ArrowForwardIcon />}
                    px={12}
                    py={8}
                    fontSize="md"
                    fontWeight="700"
                    borderRadius="none"
                    transition="all 0.2s"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    Explore Paddles
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
