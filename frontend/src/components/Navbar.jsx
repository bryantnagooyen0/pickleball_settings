import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Text,
  Image,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { PlusSquareIcon, SettingsIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../hooks/useAuth';

// Custom Link component that handles middle-click properly
const MiddleClickLink = ({ to, children, ...props }) => {
  const handleClick = (e) => {
    // If middle click (button 1) or Ctrl+click, open in new tab
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      window.open(to, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMouseDown = (e) => {
    // Handle middle click on mousedown
    if (e.button === 1) {
      e.preventDefault();
      window.open(to, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Link 
      to={to} 
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  // Check if we should show mobile menu
  const showMobileMenu = useBreakpointValue({ base: true, md: false });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mobile menu items
  const mobileMenuItems = () => {
    const items = [
      { to: '/players', label: 'Players' },
      { to: '/paddles', label: 'Paddles' },
    ];

    if (user?.role === 'admin') {
      items.push({ to: '/create', label: 'Create Player', icon: <PlusSquareIcon /> });
    }

    if (isAuthenticated) {
      items.push({ to: '/account', label: 'My Account' });
      items.push({ label: 'Log Out', onClick: onOpen, color: 'red' });
    } else {
      items.push({ to: '/login', label: 'Login' });
      items.push({ to: '/signup', label: 'Sign Up', color: 'blue' });
    }

    return items;
  };

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={1000}
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
      borderBottom="1px solid"
      borderColor="rgba(0, 0, 0, 0.08)"
      boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
      w="full"
      px={{ base: 4, md: 6 }}
    >
      <Flex
        h={{ base: 14, md: 16 }}
        alignItems={'center'}
        w={'full'}
      >
        {/* Logo */}
        <MiddleClickLink to={'/'}>
          <Box>
            <Image
              src="/logo6.png" 
              alt="Pickleball Settings Logo"
              height={{ base: '40px', md: '60px' }}
              objectFit="contain"
            />
          </Box>
        </MiddleClickLink>

        {/* Desktop Navigation */}
        {!showMobileMenu && (
          <>
            <HStack spacing={2} alignItems={'center'} ml={8}>
              <Box 
                position="relative"
                h="full"
                display="flex"
                alignItems="center"
                _hover={{
                  _after: {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    bg: "var(--color-accent)",
                  },
                }}
                _after={{
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  bg: "transparent",
                  transition: "all 0.3s ease",
                }}
              >
                <MiddleClickLink to={'/players'}>
                  <Button
                    variant={'ghost'}
                    color="var(--color-text-primary)"
                    fontFamily='"Merriweather", serif'
                    fontWeight={600}
                    border="none"
                    borderRadius={0}
                    _hover={{
                      bg: "transparent",
                    }}
                    transition="all 0.3s ease"
                  >
                    Players
                  </Button>
                </MiddleClickLink>
              </Box>
              
              <Box 
                position="relative"
                h="full"
                display="flex"
                alignItems="center"
                _hover={{
                  _after: {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    bg: "var(--color-accent)",
                  },
                }}
                _after={{
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  bg: "transparent",
                  transition: "all 0.3s ease",
                }}
              >
                <MiddleClickLink to={'/paddles'}>
                  <Button
                    variant={'ghost'}
                    color="var(--color-text-primary)"
                    fontFamily='"Merriweather", serif'
                    fontWeight={600}
                    border="none"
                    borderRadius={0}
                    _hover={{
                      bg: "transparent",
                    }}
                    transition="all 0.3s ease"
                  >
                    Paddles
                  </Button>
                </MiddleClickLink>
              </Box>
            </HStack>

            <HStack spacing={2} alignItems={'center'} ml={'auto'}>
              {user?.role === 'admin' && (
                <MiddleClickLink to={'/create'}>
                  <Button
                    fontFamily='"Inter", sans-serif'
                    fontWeight={600}
                    borderRadius="full"
                    bg="var(--color-primary)"
                    color="white"
                    _hover={{
                      bg: "var(--color-accent)",
                    }}
                    transition="all 0.3s ease"
                  >
                    <PlusSquareIcon fontSize={20} />
                  </Button>
                </MiddleClickLink>
              )}

              {isAuthenticated ? (
                <>
                  <MiddleClickLink to={'/account'}>
                    <Button 
                      variant={'outline'}
                      border="1px solid"
                      borderColor="rgba(0, 0, 0, 0.1)"
                      borderRadius="full"
                      color="var(--color-text-primary)"
                      fontFamily='"Merriweather", serif'
                      fontWeight={600}
                      _hover={{
                        bg: "var(--color-bg)",
                        borderColor: "var(--color-accent)",
                        color: "var(--color-accent)",
                      }}
                      transition="all 0.3s ease"
                    >
                      My Account
                    </Button>
                  </MiddleClickLink>
                  <Button 
                    bg="rgba(220, 38, 38, 1)"
                    color="white"
                    onClick={onOpen}
                    borderRadius="full"
                    fontFamily='"Merriweather", serif'
                    fontWeight={600}
                    _hover={{
                      bg: "rgba(220, 38, 38, 0.9)",
                    }}
                    transition="all 0.3s ease"
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <MiddleClickLink to={'/login'}>
                    <Button 
                      variant={'outline'}
                      border="1px solid"
                      borderColor="rgba(0, 0, 0, 0.1)"
                      borderRadius="full"
                      color="var(--color-text-primary)"
                      fontFamily='"Inter", sans-serif'
                      fontWeight={600}
                      _hover={{
                        bg: "var(--color-bg)",
                        borderColor: "var(--color-accent)",
                        color: "var(--color-accent)",
                      }}
                      transition="all 0.3s ease"
                    >
                      Login
                    </Button>
                  </MiddleClickLink>
                  <MiddleClickLink to={'/signup'}>
                    <Button 
                      bg="var(--color-primary)"
                      color="white"
                      borderRadius="full"
                      fontFamily='"Inter", sans-serif'
                      fontWeight={600}
                      _hover={{
                        bg: "var(--color-accent)",
                      }}
                      transition="all 0.3s ease"
                    >
                      Sign Up
                    </Button>
                  </MiddleClickLink>
                </>
              )}
            </HStack>
          </>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <Box position="relative" ml="auto">
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<HamburgerIcon />}
                variant="outline"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.1)"
                color="var(--color-text-primary)"
                bg="transparent"
                fontFamily="var(--font-body)"
                _hover={{
                  bg: "var(--color-bg)",
                  borderColor: "var(--color-primary)",
                }}
                transition="all 0.3s ease"
              />
              <MenuList 
                placement="bottom-end"
                minW="200px"
                right={0}
                left="auto"
                transform="translateX(0)"
                borderRadius="0"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.1)"
                bg="white"
                fontFamily="var(--font-body)"
                boxShadow="0 4px 16px rgba(0, 0, 0, 0.1)"
              >
                {mobileMenuItems().map((item, index) => (
                  <MenuItem
                    key={index}
                    onClick={item.onClick}
                    color={item.color === 'red' ? 'rgba(220, 38, 38, 1)' : item.color === 'blue' ? 'var(--color-primary)' : 'var(--color-text-primary)'}
                    icon={item.icon}
                    fontFamily="var(--font-body)"
                    fontWeight={500}
                    _hover={{
                      bg: "var(--color-bg)",
                    }}
                  >
                    {item.to ? (
                      <MiddleClickLink to={item.to}>
                        {item.label}
                      </MiddleClickLink>
                    ) : (
                      item.label
                    )}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Box>
        )}
      </Flex>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent
            sx={{
              fontFamily: 'var(--font-body)',
            }}
            borderRadius="0"
          >
            <AlertDialogHeader
              fontSize='xl'
              fontWeight={600}
              fontFamily='"Merriweather", serif'
              color="var(--color-text-primary)"
            >
              Log Out
            </AlertDialogHeader>

            <AlertDialogBody
              fontFamily='"Inter", sans-serif'
              color="var(--color-text-secondary)"
            >
              Are you sure you want to log out?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.2)"
                fontFamily='"Inter", sans-serif'
                fontWeight={500}
                _hover={{
                  bg: "rgba(0, 0, 0, 0.05)",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                ml={3}
                bg="rgba(220, 38, 38, 1)"
                color="white"
                borderRadius="full"
                fontFamily='"Inter", sans-serif'
                fontWeight={500}
                _hover={{
                  bg: "rgba(220, 38, 38, 0.9)",
                }}
                transition="all 0.3s ease"
              >
                Log Out
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Navbar;
