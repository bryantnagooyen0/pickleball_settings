import React from 'react';
import { Box, Text, HStack, Badge, Image, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import SetupCanvas from './SetupCanvas';

const SetupCard = ({ setup, compact = false }) => {
  const navigate = useNavigate();
  const canvasWidth = compact ? 90 : 120;

  return (
    <Box
      bg="gray.800"
      borderRadius="lg"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.700"
      cursor="pointer"
      _hover={{ borderColor: 'orange.400', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
      transition="all 0.2s"
      onClick={() => navigate(`/setup/${setup._id}`)}
    >
      {/* Canvas preview */}
      <Box bg="gray.900" display="flex" justifyContent="center" alignItems="center" py={compact ? 2 : 3} px={2} position="relative">
        <SetupCanvas strips={setup.leadTapeStrips || []} readOnly width={canvasWidth} />
        {setup.photoUrl && (
          <Badge position="absolute" top={2} right={2} colorScheme="blue" fontSize="xs">📷</Badge>
        )}
      </Box>

      {/* Info */}
      <Box p={compact ? 2 : 3}>
        <Text color="white" fontWeight="bold" fontSize={compact ? 'xs' : 'sm'} noOfLines={1}>
          {setup.paddle?.name || 'Unknown Paddle'}
        </Text>
        <Text color="gray.400" fontSize="xs" mt={0.5}>by @{setup.authorName}</Text>

        {/* Mod badges */}
        <HStack mt={2} flexWrap="wrap" spacing={1}>
          {setup.leadTapeTotalGrams > 0 && (
            <Badge colorScheme="orange" fontSize="xs">Lead: {setup.leadTapeTotalGrams}g</Badge>
          )}
          {setup.overgrip?.brand && (
            <Badge colorScheme="gray" fontSize="xs">{setup.overgrip.brand}</Badge>
          )}
          {setup.totalWeightGrams > 0 && (
            <Badge colorScheme="purple" fontSize="xs">{setup.totalWeightGrams}g total</Badge>
          )}
        </HStack>

        {/* Likes & comments */}
        <HStack mt={2} justify="space-between">
          <Text color="red.400" fontSize="xs">❤️ {setup.likesCount || 0}</Text>
          <Text color="gray.500" fontSize="xs">💬 comments</Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default SetupCard;
