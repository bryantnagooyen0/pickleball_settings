import React from 'react';
import { Box, Text, HStack, Badge, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import SetupCanvas from './SetupCanvas';

const BRAND = {
  bg: '#FAF9F6',
  primary: '#2C5F7C',
  secondary: '#D4A574',
  accent: '#8B9DC3',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  fontBody: '"Inter", sans-serif',
};

const SetupCard = ({ setup, compact = false }) => {
  const navigate = useNavigate();
  const canvasWidth = compact ? 90 : 120;

  return (
    <Box
      bg="white"
      borderRadius="0"
      overflow="hidden"
      border="1px solid"
      borderColor="rgba(0,0,0,0.08)"
      boxShadow="0 2px 12px rgba(0,0,0,0.04)"
      cursor="pointer"
      position="relative"
      _hover={{
        borderColor: BRAND.primary,
        boxShadow: '0 6px 24px rgba(44,95,124,0.1)',
        transform: 'translateY(-3px)',
      }}
      transition="all 0.3s cubic-bezier(0.16,1,0.3,1)"
      onClick={() => navigate(`/setup/${setup._id}`)}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        w="3px"
        h="100%"
        bg={BRAND.primary}
        zIndex={1}
      />

      {/* Canvas preview */}
      <Box
        bg={BRAND.bg}
        display="flex"
        justifyContent="center"
        alignItems="center"
        py={compact ? 2 : 3}
        px={2}
        position="relative"
        borderBottom="1px solid"
        borderColor="rgba(0,0,0,0.06)"
      >
        <SetupCanvas
          strips={setup.leadTapeStrips || []}
          readOnly
          width={canvasWidth}
          paddleShape={setup.paddle?.shape}
        />
        {setup.photoUrl && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            bg={BRAND.accent}
            color="white"
            fontSize="xs"
            borderRadius="0"
            px={1.5}
          >
            📷
          </Badge>
        )}
      </Box>

      {/* Info */}
      <Box p={compact ? 2 : 3} pl={compact ? 3 : 4}>
        <Text
          color={BRAND.textPrimary}
          fontWeight={600}
          fontSize={compact ? 'xs' : 'sm'}
          fontFamily={BRAND.fontBody}
          noOfLines={1}
        >
          {setup.paddle?.name || 'Unknown Paddle'}
        </Text>
        <Text color={BRAND.textSecondary} fontSize="xs" mt={0.5} fontFamily={BRAND.fontBody}>
          by @{setup.authorName}
        </Text>

        {/* Mod badges */}
        <HStack mt={2} flexWrap="wrap" spacing={1}>
          {setup.leadTapeTotalGrams > 0 && (
            <Badge
              bg={`${BRAND.secondary}22`}
              color={BRAND.textPrimary}
              fontSize="xs"
              borderRadius="0"
              fontFamily={BRAND.fontBody}
              fontWeight={500}
            >
              Lead: {setup.leadTapeTotalGrams}g
            </Badge>
          )}
          {setup.overgrip?.brand && (
            <Badge
              bg="rgba(0,0,0,0.06)"
              color={BRAND.textSecondary}
              fontSize="xs"
              borderRadius="0"
              fontFamily={BRAND.fontBody}
              fontWeight={500}
            >
              {setup.overgrip.brand}
            </Badge>
          )}
          {setup.totalWeightGrams > 0 && (
            <Badge
              bg={`${BRAND.accent}22`}
              color={BRAND.primary}
              fontSize="xs"
              borderRadius="0"
              fontFamily={BRAND.fontBody}
              fontWeight={500}
            >
              {setup.totalWeightGrams}g total
            </Badge>
          )}
        </HStack>

        {/* Likes & comments */}
        <HStack mt={2} justify="space-between">
          <Text color={BRAND.secondary} fontSize="xs" fontFamily={BRAND.fontBody}>
            ❤️ {setup.likesCount || 0}
          </Text>
          <Text color={BRAND.textSecondary} fontSize="xs" fontFamily={BRAND.fontBody}>
            💬
          </Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default SetupCard;
