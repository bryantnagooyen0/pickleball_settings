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
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      boxShadow="sm"
      w="100vw"
      px={6}
    >
      <Flex
        h={16}
        alignItems={'center'}
        w={'full'}
      >
        {/* Logo */}
        <MiddleClickLink to={'/'}>
          <Box>
            <Image
              src="/logo6.png" 
              alt="Pickleball Settings Logo"
              height="60px"
              objectFit="contain"
            />
          </Box>
        </MiddleClickLink>

        {/* Desktop Navigation */}
        {!showMobileMenu && (
          <>
            <HStack spacing={2} alignItems={'center'} ml={8}>
              <MiddleClickLink to={'/players'}>
                <Button variant={'outline'}>Players</Button>
              </MiddleClickLink>
              
              <MiddleClickLink to={'/paddles'}>
                <Button variant={'outline'}>Paddles</Button>
              </MiddleClickLink>
            </HStack>

            <HStack spacing={2} alignItems={'center'} ml={'auto'}>
              {user?.role === 'admin' && (
                <MiddleClickLink to={'/create'}>
                  <Button>
                    <PlusSquareIcon fontSize={20} />
                  </Button>
                </MiddleClickLink>
              )}

              {isAuthenticated ? (
                <>
                  <MiddleClickLink to={'/account'}>
                    <Button variant={'outline'}>My Account</Button>
                  </MiddleClickLink>
                  <Button colorScheme={'red'} onClick={onOpen}>Log Out</Button>
                </>
              ) : (
                <>
                  <MiddleClickLink to={'/login'}>
                    <Button variant={'outline'}>Login</Button>
                  </MiddleClickLink>
                  <MiddleClickLink to={'/signup'}>
                    <Button colorScheme={'blue'}>Sign Up</Button>
                  </MiddleClickLink>
                </>
              )}
            </HStack>
          </>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="outline"
            />
            <MenuList>
              {mobileMenuItems().map((item, index) => (
                <MenuItem
                  key={index}
                  onClick={item.onClick}
                  color={item.color}
                  icon={item.icon}
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
        )}
      </Flex>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Log Out
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to log out?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                ml={3}
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
