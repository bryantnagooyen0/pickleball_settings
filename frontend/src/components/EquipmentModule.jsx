import React from 'react';
import {
  Box,
  Text,
  Image,
  Button,
  HStack,
  VStack,
  Stack,
  SimpleGrid,
  Icon,
  Badge,
  Heading,
} from '@chakra-ui/react';
import { FaShoppingBag } from 'react-icons/fa';
import { TbShoe } from 'react-icons/tb';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

// Custom Paddle SVG Icon Component
const PaddleIcon = ({ ...props }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 200 300'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    {/* Paddle Head - Rounded oval shape */}
    <ellipse cx='100' cy='80' rx='50' ry='65' />
    
    {/* Paddle Handle */}
    <line x1='100' y1='145' x2='100' y2='280' strokeWidth='14' />
    
    {/* Handle grip lines for detail */}
    <line x1='85' y1='180' x2='115' y2='180' strokeWidth='1' opacity='0.5' />
    <line x1='85' y1='210' x2='115' y2='210' strokeWidth='1' opacity='0.5' />
    <line x1='85' y1='240' x2='115' y2='240' strokeWidth='1' opacity='0.5' />
  </svg>
);

// Custom Modifications SVG Icon Component
const ModificationsIcon = ({ ...props }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    {...props}
  >
    <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
  </svg>
);

const EquipmentModule = ({
  type,
  player,
  title,
  icon,
  imageField,
  nameField,
  brandField,
  modelField,
  specifications = [],
  modifications = [],
  badgeColor = 'blue',
  hideProductDisplay = false,
}) => {
  const handleCheckPrice = (item = null) => {
    // Get the price link from the player data
    const priceLink = player.paddlePriceLink;
    
    if (priceLink && priceLink.trim() !== '') {
      // Open the price link in a new tab
      window.open(priceLink, '_blank', 'noopener,noreferrer');
    } else {
      // If no price link is available, show a message
      alert('No price link available for this paddle. Please add a price link when editing the paddle.');
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'paddle':
        return '/paddleiconTilted.png';
      case 'shoes':
        return '/shoesiconT.png';
      case 'modifications':
        return '/cogT.png';
      default:
        return '/paddleiconTilted.png';
    }
  };

  const getImage = () => {
    if (!imageField) return null;
    return player[imageField];
  };

  const getName = () => {
    if (!nameField) return 'No item specified';
    return player[nameField] || 'No item specified';
  };

  const getBrand = () => {
    if (!brandField) return null;
    return player[brandField];
  };

  const getModel = () => {
    if (!modelField) return null;
    return player[modelField];
  };

  const renderSpecifications = () => {
    if (specifications.length === 0) return null;

    return (
      <SimpleGrid columns={2} spacing={4}>
        {specifications.map((spec, index) => (
          <MotionBox 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Box>
              <Text 
                fontSize='xs' 
                color='var(--color-text-secondary)'
                fontFamily='var(--font-body)'
                fontWeight={600}
                mb={2}
                textTransform='uppercase'
                letterSpacing='0.05em'
              >
                {spec.label}
              </Text>
              <Text 
                fontSize='md' 
                fontWeight={600}
                fontFamily='var(--font-body)'
                color='var(--color-text-primary)'
              >
                {player[spec.field] || spec.default || 'Not specified'}
              </Text>
            </Box>
          </MotionBox>
        ))}
      </SimpleGrid>
    );
  };

  const renderModifications = () => {
    if (modifications.length === 0) return null;

    return (
      <VStack spacing={4}>
        {modifications.map((mod, index) => {
          const imageField = mod.imageField || `${mod.field}Image`;
          const imageUrl = player[imageField];
          
          // Skip overgrips if both text and image are not filled
          if (mod.field === 'overgrips') {
            const hasText = player[mod.field] && player[mod.field].trim() !== '';
            const hasImage = imageUrl && imageUrl.trim() !== '';
            if (!hasText && !hasImage) {
              return null;
            }
          }
          
          // Skip additional modification if both text and image are not filled
          if (mod.field === 'additionalModification') {
            const hasText = player[mod.field] && player[mod.field].trim() !== '';
            const hasImage = imageUrl && imageUrl.trim() !== '';
            if (!hasText || !hasImage) {
              return null;
            }
          }
          
          // Special layout for weight module
          if (mod.field === 'weight') {
            return (
              <MotionBox
                key={index}
                bg='white'
                p={6}
                borderRadius={0}
                border='none'
                w='full'
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Weight Setup Title */}
                <Heading
                  as='h4'
                  fontSize='md' 
                  fontWeight={700}
                  fontFamily='var(--font-display)'
                  color='var(--color-text-primary)'
                  textAlign='center' 
                  mb={4}
                  letterSpacing='-0.01em'
                >
                  Weight Setup
                </Heading>
                
                <Stack 
                  direction={{ base: 'column', md: 'row' }} 
                  align={{ base: 'center', md: 'flex-start' }} 
                  spacing={{ base: 4, md: 6 }}
                >
                  {/* Image - Top on mobile, Left on desktop */}
                  <Box align={{ base: 'center', md: 'flex-start' }}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={mod.label}
                      w={{ base: 48, md: 64 }}
                      h={{ base: 48, md: 64 }}
                      borderRadius='md'
                      objectFit='contain'
                      border='none'
                      loading='lazy'
                      fallback={
                        <Box
                          w={{ base: 48, md: 64 }}
                          h={{ base: 48, md: 64 }}
                          bg='gray.300'
                          borderRadius='md'
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                        >
                          {typeof getIcon() === 'string' ? (
                            <Image src={getIcon()} w={icon === 'paddle' ? 8 : 8} h={icon === 'paddle' ? 8 : 8} alt="icon" />
                          ) : (
                            <Icon as={getIcon()} w={icon === 'paddle' ? 12 : 8} h={icon === 'paddle' ? 12 : 8} color='gray.500' />
                          )}
                        </Box>
                      }
                    />
                  ) : (
                      <Box
                        w={{ base: 12, md: 16 }}
                        h={{ base: 12, md: 16 }}
                        bg='gray.300'
                        borderRadius='md'
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                      >
                        {typeof getIcon() === 'string' ? (
                          <Image src={getIcon()} w={icon === 'paddle' ? 8 : 8} h={icon === 'paddle' ? 8 : 8} alt="icon" />
                        ) : (
                          <Icon as={getIcon()} w={icon === 'paddle' ? 12 : 8} h={icon === 'paddle' ? 12 : 8} color='gray.500' />
                        )}
                      </Box>
                    )}
                  </Box>
                  
                  {/* Weight details - Below image on mobile, Right side on desktop */}
                  <VStack align='start' spacing={3} flex={1} w={{ base: 'full', md: 'auto' }}>
                    <Box>
                      <Text 
                        fontSize='xs' 
                        color='var(--color-text-secondary)'
                        fontFamily='var(--font-body)'
                        fontWeight={600}
                        mb={1}
                        textTransform='uppercase'
                        letterSpacing='0.05em'
                      >
                        Total Weight
                      </Text>
                      <Text 
                        fontSize='md' 
                        fontWeight={600}
                        fontFamily='var(--font-body)'
                        color='var(--color-text-primary)'
                      >
                        {player.totalWeight || 'Not specified'}
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text 
                        fontSize='xs' 
                        color='var(--color-text-secondary)'
                        fontFamily='var(--font-body)'
                        fontWeight={600}
                        mb={1}
                        textTransform='uppercase'
                        letterSpacing='0.05em'
                      >
                        Weight Location
                      </Text>
                      <Text 
                        fontSize='md' 
                        fontWeight={600}
                        fontFamily='var(--font-body)'
                        color='var(--color-text-primary)'
                      >
                        {player.weightLocation || 'Not specified'}
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text 
                        fontSize='xs' 
                        color='var(--color-text-secondary)'
                        fontFamily='var(--font-body)'
                        fontWeight={600}
                        mb={1}
                        textTransform='uppercase'
                        letterSpacing='0.05em'
                      >
                        Tape Details
                      </Text>
                      <Text 
                        fontSize='md' 
                        fontWeight={600}
                        fontFamily='var(--font-body)'
                        color='var(--color-text-primary)'
                        whiteSpace='pre-line'
                      >
                        {player.tapeDetails || 'Not specified'}
                      </Text>
                    </Box>
                    
                    {player[mod.brandField] && (
                      <Badge
                        px={3}
                        py={1}
                        borderRadius='full'
                        bg='var(--color-primary)'
                        color='white'
                        fontSize='xs'
                        fontFamily='var(--font-body)'
                        fontWeight={600}
                      >
                        {player[mod.brandField]}
                      </Badge>
                    )}
                  </VStack>
                </Stack>
              </MotionBox>
            );
          }
          
          // Default layout for other modifications
          return (
            <MotionBox
              key={index}
              bg='white'
              p={4}
              borderRadius={0}
              border='none'
              w='full'
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <HStack justify='space-between' align='center'>
                <HStack spacing={4}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={mod.label}
                      w={16}
                      h={16}
                      borderRadius='md'
                      objectFit='cover'
                      border='none'
                      loading='lazy'
                      fallback={
                        <Box
                          w={16}
                          h={16}
                          bg='gray.300'
                          borderRadius='md'
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                        >
                          {typeof getIcon() === 'string' ? (
                            <Image src={getIcon()} w={icon === 'paddle' ? 8 : 8} h={icon === 'paddle' ? 8 : 8} alt="icon" />
                          ) : (
                            <Icon as={getIcon()} w={icon === 'paddle' ? 12 : 8} h={icon === 'paddle' ? 12 : 8} color='gray.500' />
                          )}
                        </Box>
                      }
                    />
                  ) : (
                    <Box
                      w={16}
                      h={16}
                      bg='gray.300'
                      borderRadius='md'
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                    >
                      {typeof getIcon() === 'string' ? (
                        <Image src={getIcon()} w={icon === 'paddle' ? 8 : 8} h={icon === 'paddle' ? 8 : 8} alt="icon" />
                      ) : (
                        <Icon as={getIcon()} w={icon === 'paddle' ? 12 : 8} h={icon === 'paddle' ? 12 : 8} color='gray.500' />
                      )}
                    </Box>
                  )}
                  <VStack align='start' spacing={1}>
                    <Text 
                      fontSize='xs' 
                      color='var(--color-text-secondary)'
                      fontFamily='var(--font-body)'
                      fontWeight={600}
                      textTransform='uppercase'
                      letterSpacing='0.05em'
                    >
                      {mod.label}
                    </Text>
                    <Text 
                      fontSize='md' 
                      fontWeight={600}
                      fontFamily='var(--font-body)'
                      color='var(--color-text-primary)'
                    >
                      {player[mod.field] || 'None specified'}
                    </Text>
                    {player[mod.brandField] && (
                      <Badge
                        px={3}
                        py={1}
                        borderRadius='full'
                        bg='var(--color-primary)'
                        color='white'
                        fontSize='xs'
                        fontFamily='var(--font-body)'
                        fontWeight={600}
                      >
                        {player[mod.brandField]}
                      </Badge>
                    )}
                  </VStack>
                </HStack>
                {mod.field !== 'overgrips' && mod.field !== 'additionalModification' && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size='sm'
                      px={4}
                      py={2}
                      h='auto'
                      bg="var(--color-primary)"
                      color="white"
                      leftIcon={<FaShoppingBag />}
                      onClick={() => handleCheckPrice(mod.field)}
                      fontFamily='var(--font-body)'
                      fontWeight={600}
                      fontSize='sm'
                      borderRadius='full'
                      border='none'
                      _hover={{
                        bg: "var(--color-accent)",
                      }}
                      transition="all 0.3s ease"
                    >
                      Check price
                    </Button>
                  </motion.div>
                )}
              </HStack>
            </MotionBox>
          );
        })}
      </VStack>
    );
  };

  return (
    <MotionBox
      w='full'
      bg='white'
      borderRadius={0}
      boxShadow='0 4px 20px rgba(0, 0, 0, 0.08)'
      border='none'
      sx={{
        '--color-primary': '#2C5F7C',
        '--color-accent': '#FF6B6B',
        '--font-display': '"Merriweather", serif',
        '--font-body': '"Inter", sans-serif',
      }}
      overflow='hidden'
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Module Header */}
      <Box 
        p={4} 
        borderBottom='1px solid' 
        borderColor='rgba(0, 0, 0, 0.08)'
        bg='white'
      >
        <HStack align='center' spacing={2}>
          {typeof getIcon() === 'string' ? (
            <Image 
              src={getIcon()} 
              w={icon === 'paddle' ? '2.5rem' : icon === 'shoes' ? '3rem' : icon === 'modifications' ? '2.5rem' : '0.875rem'} 
              h={icon === 'paddle' ? '2.5rem' : icon === 'shoes' ? '3rem' : icon === 'modifications' ? '2.5rem' : '0.875rem'} 
              alt="icon"
              objectFit='contain'
            />
          ) : (
            <Icon as={getIcon()} w={icon === 'paddle' ? 14 : 10} h={icon === 'paddle' ? 14 : 10} color='var(--color-primary)' />
          )}
          <Heading 
            as='h3' 
            fontSize='lg' 
            fontWeight={700}
            fontFamily='var(--font-display)'
            color='var(--color-text-primary)'
          >
            {title}
          </Heading>
        </HStack>
      </Box>

      {/* Product Display */}
      <Box p={6}>
        {!hideProductDisplay && (
          <MotionBox
            bg='white'
            p={5}
            borderRadius={0}
            mb={6}
            border='none'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Stack 
              direction={{ base: 'column', md: 'row' }} 
              justify={{ base: 'center', md: 'space-between' }} 
              align={{ base: 'center', md: 'center' }}
              spacing={{ base: 4, md: 0 }}
            >
              <Stack 
                direction={{ base: 'column', md: 'row' }} 
                align={{ base: 'center', md: 'center' }} 
                spacing={{ base: 3, md: 4 }}
                w={{ base: 'full', md: 'auto' }}
              >
                {getImage() ? (
                  <Image
                    src={getImage()}
                    alt={title}
                    w={16}
                    h={16}
                    borderRadius='md'
                    objectFit='cover'
                    border='none'
                    flexShrink={0}
                    loading='lazy'
                    fallback={
                      <Box
                        w={16}
                        h={16}
                        bg='gray.300'
                        borderRadius='md'
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        flexShrink={0}
                      >
                        {typeof getIcon() === 'string' ? (
                          <Image src={getIcon()} w={icon === 'paddle' ? 8 : 8} h={icon === 'paddle' ? 8 : 8} alt="icon" />
                        ) : (
                          <Icon as={getIcon()} w={icon === 'paddle' ? 12 : 8} h={icon === 'paddle' ? 12 : 8} color='gray.500' />
                        )}
                      </Box>
                    }
                  />
                ) : (
                  <Box
                    w={16}
                    h={16}
                    bg='gray.300'
                    borderRadius='md'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    flexShrink={0}
                  >
                    {typeof getIcon() === 'string' ? (
                      <Image src={getIcon()} w={icon === 'paddle' ? 8 : 8} h={icon === 'paddle' ? 8 : 8} alt="icon" />
                    ) : (
                      <Icon as={getIcon()} w={icon === 'paddle' ? 12 : 8} h={icon === 'paddle' ? 12 : 8} color='gray.500' />
                    )}
                  </Box>
                )}
                <VStack align={{ base: 'center', md: 'start' }} spacing={2} w={{ base: 'full', md: 'auto' }}>
                  <Text 
                    fontSize={{ base: 'lg', md: 'xl' }} 
                    fontWeight={700}
                    fontFamily='var(--font-display)'
                    color='var(--color-text-primary)'
                    textAlign={{ base: 'center', md: 'left' }}
                    wordBreak='break-word'
                    w='full'
                    letterSpacing='-0.01em'
                  >
                    {getName()}
                  </Text>
                  <HStack spacing={2} flexWrap='wrap' justify={{ base: 'center', md: 'flex-start' }}>
                    {getBrand() && (
                      <Badge
                        px={3}
                        py={1}
                        borderRadius='full'
                        bg='var(--color-primary)'
                        color='white'
                        fontSize='xs'
                        fontFamily='var(--font-body)'
                        fontWeight={600}
                      >
                        {getBrand()}
                      </Badge>
                    )}
                    {getModel() && (
                      <Badge
                        px={3}
                        py={1}
                        borderRadius='full'
                        border='1px solid'
                        borderColor='var(--color-primary)'
                        bg='transparent'
                        color='var(--color-primary)'
                        fontSize='xs'
                        fontFamily='var(--font-body)'
                        fontWeight={600}
                      >
                        {getModel()}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </Stack>
              {icon !== 'shoes' && (
                <Button
                  size='sm'
                  bg="var(--color-primary)"
                  color="white"
                  leftIcon={<FaShoppingBag />}
                  onClick={() => handleCheckPrice()}
                  _hover={{
                    bg: "var(--color-accent)",
                  }}
                  transition="all 0.3s ease"
                >
                  Check price
                </Button>
              )}
            </Stack>
          </MotionBox>
        )}

        {/* Specifications or Modifications */}
        {specifications.length > 0 && (
          <MotionBox
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {renderSpecifications()}
          </MotionBox>
        )}
        {modifications.length > 0 && (
          <MotionBox
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {renderModifications()}
          </MotionBox>
        )}
      </Box>
    </MotionBox>
  );
};

export default EquipmentModule;
