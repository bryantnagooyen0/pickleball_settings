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
} from '@chakra-ui/react';
import { PlusSquareIcon, SettingsIcon } from '@chakra-ui/icons';
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

  const handleLogout = () => {
    logout();
    navigate('/');
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
        justifyContent={'space-between'}
        w={'full'}
        flexDir={{
          base: 'column',
          sm: 'row',
        }}
      >
        <HStack spacing={4} alignItems={'center'}>
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
          
          {/* Navigation Buttons */}
          <HStack spacing={2} alignItems={'center'}>
            <MiddleClickLink to={'/players'}>
              <Button variant={'outline'}>Players</Button>
            </MiddleClickLink>
            
            <MiddleClickLink to={'/paddles'}>
              <Button variant={'outline'}>Paddles</Button>
            </MiddleClickLink>
          </HStack>
        </HStack>

        <HStack spacing={2} alignItems={'center'}>
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
