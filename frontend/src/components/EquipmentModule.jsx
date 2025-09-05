import React from 'react';
import {
  Box,
  Text,
  Image,
  Button,
  HStack,
  VStack,
  SimpleGrid,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FaShoppingBag } from 'react-icons/fa';
import { TbShoe } from 'react-icons/tb';

// Custom Paddle SVG Icon Component
const PaddleIcon = ({ ...props }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 700 875'
    fill='currentColor'
    {...props}
  >
    <path d='M373.9,621.6c-10,5.3-35.7,5.3-45.7,0c-2.2-1.2-3.9-6-4.5-8.7c-1.9-9,3.4-26.9,3.4-36.1c0-17.5,1.1-114,1.1-114h45.7  c0,0,1.1,98.9,1.1,114c0,9.2,5.3,27.1,3.4,36.1C377.8,615.5,376.1,620.5,373.9,621.6z' />
    <path d='M374.7,458.9h-47.2c-1,0-1.8-0.8-1.8-1.8v-7.8c0-1,0.8-1.8,1.8-1.8h47.2c1,0,1.8,0.8,1.8,1.8v7.8  C376.5,458.1,375.7,458.9,374.7,458.9z' />
    <g>
      <path d='M407.8,116.6c18.3,0,33.7,5.6,44.4,16.1c9.6,9.4,14.8,22.3,14.8,36.3v152.7c0,28-11.7,41.6-29.1,53.4   c-19.8,13.3-43.1,30.6-51.6,37.5c-10.8,8.8-17,17-18.8,24.9h-32.9c-1.8-7.9-8-16.1-18.8-24.9c-8.8-7-32.3-24.4-51.6-37.5   c-17.5-11.8-29.2-25.4-29.2-53.4V169c0-14,5.3-26.9,14.8-36.3c10.7-10.5,26-16.1,44.4-16.1H407.8 M407.8,110.6   c-16.7,0-96.9,0-113.6,0c-42.7,0-65.2,28-65.2,58.4c0,20.5,0,140.5,0,152.7c0,31.8,14.3,46.6,31.8,58.4   c18.8,12.7,42.3,30.1,51.2,37.2c9.2,7.5,17.9,16.9,17,26.2c11.4,0,32.6,0,44,0c-0.9-9.3,7.8-18.7,17-26.2   c8.8-7.1,32.3-24.5,51.2-37.2c17.5-11.8,31.8-26.6,31.8-58.4c0-12.2,0-132.2,0-152.7C473,138.6,450.4,110.6,407.8,110.6   L407.8,110.6z' />
      <path d='M407.8,125.6c16.2,0,29.5,4.7,38.4,13.7c7.6,7.7,11.8,18.2,11.8,29.7v152.7c0,24.2-9.2,35.2-25.2,46   c-20,13.4-43.6,31-52.3,38c-9.6,7.8-16,15.3-19.5,22.9h-20.2c-3.5-7.6-9.9-15.1-19.5-22.9c-9-7.1-32.7-24.8-52.2-38   c-16-10.8-25.2-21.7-25.2-46V169c0-11.5,4.2-22,11.8-29.7c8.9-9,22.2-13.7,38.4-13.7H407.8 M407.8,120.6H294.2   c-38.1,0-55.2,24.3-55.2,48.4v152.7c0,26.3,10.5,38.7,27.4,50.1c19.4,13.1,43,30.6,51.9,37.7c10.2,8.3,16.5,16.2,19.3,24h26.9   c2.7-7.8,9.1-15.7,19.3-24c8.6-6.9,32.1-24.4,51.9-37.7c16.9-11.4,27.4-23.8,27.4-50.1V169C463,144.9,445.9,120.6,407.8,120.6   L407.8,120.6z' />
    </g>
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
    // TODO: Implement price checking functionality
    console.log('Check price for:', item || nameField);
  };

  const getIcon = () => {
    switch (icon) {
      case 'paddle':
        return PaddleIcon;
      case 'shoes':
        return TbShoe;
      case 'modifications':
        return ModificationsIcon;
      default:
        return PaddleIcon;
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
          <Box key={index}>
            <Text fontSize='sm' color='gray.600' fontWeight='medium' mb={1}>
              {spec.label}
            </Text>
            <Text fontSize='md' fontWeight='semibold' color='gray.800'>
              {player[spec.field] || spec.default || 'Not specified'}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  const renderModifications = () => {
    if (modifications.length === 0) return null;

    return (
      <VStack spacing={4}>
        {modifications.map((mod, index) => (
          <Box
            key={index}
            bg='gray.50'
            p={4}
            borderRadius='md'
            border='1px solid'
            borderColor='gray.200'
            w='full'
          >
            <HStack justify='space-between' align='center'>
              <VStack align='start' spacing={1}>
                <Text fontSize='sm' color='gray.600' fontWeight='medium'>
                  {mod.label}
                </Text>
                <Text fontSize='md' fontWeight='semibold' color='gray.800'>
                  {player[mod.field] || 'None specified'}
                </Text>
                {player[mod.brandField] && (
                  <Badge
                    colorScheme={mod.badgeColor || 'purple'}
                    variant='subtle'
                    size='sm'
                  >
                    {player[mod.brandField]}
                  </Badge>
                )}
              </VStack>
              <Button
                size='sm'
                colorScheme='blue'
                leftIcon={<FaShoppingBag />}
                onClick={() => handleCheckPrice(mod.field)}
              >
                Check price
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    );
  };

  return (
    <Box
      w='full'
      bg='white'
      borderRadius='lg'
      boxShadow='lg'
      border='1px solid'
      borderColor='gray.200'
      overflow='hidden'
    >
      {/* Module Header */}
      <Box p={6} borderBottom='1px solid' borderColor='gray.200'>
        <HStack align='center' spacing={3}>
          <Icon as={getIcon()} w={10} h={10} color='gray.600' />
          <Text fontSize='xl' fontWeight='bold' color='gray.800'>
            {title}
          </Text>
        </HStack>
      </Box>

      {/* Product Display */}
      <Box p={6}>
        {!hideProductDisplay && (
          <Box
            bg='gray.50'
            p={4}
            borderRadius='md'
            mb={6}
            border='1px solid'
            borderColor='gray.200'
          >
            <HStack justify='space-between' align='center'>
              <HStack spacing={4}>
                {getImage() ? (
                  <Image
                    src={getImage()}
                    alt={title}
                    w={16}
                    h={16}
                    borderRadius='md'
                    objectFit='cover'
                    border='1px solid'
                    borderColor='gray.300'
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
                    <Icon as={getIcon()} w={8} h={8} color='gray.500' />
                  </Box>
                )}
                <VStack align='start' spacing={1}>
                  <Text fontSize='lg' fontWeight='bold' color='gray.800'>
                    {getName()}
                  </Text>
                  <HStack spacing={2}>
                    {getBrand() && (
                      <Badge
                        colorScheme={badgeColor}
                        variant='subtle'
                        size='sm'
                      >
                        {getBrand()}
                      </Badge>
                    )}
                    {getModel() && (
                      <Badge
                        colorScheme={badgeColor}
                        variant='outline'
                        size='sm'
                      >
                        {getModel()}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <Button
                size='sm'
                colorScheme='blue'
                leftIcon={<FaShoppingBag />}
                onClick={() => handleCheckPrice()}
              >
                Check price
              </Button>
            </HStack>
          </Box>
        )}

        {/* Specifications or Modifications */}
        {specifications.length > 0 && renderSpecifications()}
        {modifications.length > 0 && renderModifications()}
      </Box>
    </Box>
  );
};

export default EquipmentModule;
