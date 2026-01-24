import React from 'react';
import { Box, Container, VStack, HStack, Text, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);
const MotionText = motion(Text);

const Footer = () => {
  return (
    <MotionBox
      as="footer"
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
      borderTop="1px solid"
      borderColor="rgba(0, 0, 0, 0.08)"
      mt="auto"
      position="relative"
      overflow="hidden"
    >
      {/* Subtle background gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        zIndex={0}
        sx={{
          background: `
            radial-gradient(circle at 50% 0%, rgba(44, 95, 124, 0.04) 0%, transparent 50%)
          `,
        }}
      />

      <Container maxW="container.xl" py={{ base: 10, md: 12 }} position="relative" zIndex={1}>
        <VStack spacing={{ base: 6, md: 8 }}>
          {/* Footer Links */}
          <MotionHStack
            spacing={{ base: 6, md: 10 }}
            wrap="wrap"
            justify="center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              as={RouterLink}
              to="/privacy-policy"
              color="var(--color-text-secondary)"
              fontFamily="var(--font-body)"
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight={500}
              position="relative"
              _hover={{
                color: "var(--color-primary)",
                textDecoration: "none",
              }}
              transition="all 0.3s ease"
              sx={{
                _after: {
                  content: '""',
                  position: "absolute",
                  bottom: "-2px",
                  left: 0,
                  right: 0,
                  height: "1px",
                  bg: "var(--color-primary)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.3s ease",
                },
                _hover: {
                  _after: {
                    transform: "scaleX(1)",
                  },
                },
              }}
            >
              Privacy Policy
            </Link>
            <Box
              w="1px"
              h="16px"
              bg="rgba(0, 0, 0, 0.1)"
            />
            <Link
              as={RouterLink}
              to="/legal-notice"
              color="var(--color-text-secondary)"
              fontFamily="var(--font-body)"
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight={500}
              position="relative"
              _hover={{
                color: "var(--color-primary)",
                textDecoration: "none",
              }}
              transition="all 0.3s ease"
              sx={{
                _after: {
                  content: '""',
                  position: "absolute",
                  bottom: "-2px",
                  left: 0,
                  right: 0,
                  height: "1px",
                  bg: "var(--color-primary)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.3s ease",
                },
                _hover: {
                  _after: {
                    transform: "scaleX(1)",
                  },
                },
              }}
            >
              Legal Notice
            </Link>
          </MotionHStack>

          {/* Copyright */}
          <MotionText
            fontSize={{ base: 'xs', md: 'sm' }}
            color="var(--color-text-secondary)"
            textAlign="center"
            fontFamily="var(--font-body)"
            fontWeight={400}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            © {new Date().getFullYear()} Pickleball Settings. All rights reserved.
          </MotionText>
        </VStack>
      </Container>
    </MotionBox>
  );
};

export default Footer;
