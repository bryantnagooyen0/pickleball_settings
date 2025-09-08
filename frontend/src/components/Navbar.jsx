import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { PlusSquareIcon, SettingsIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  // Helper function to decode JWT and get role
  const getRoleFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const handleStorage = () => {
      setHasToken(!!localStorage.getItem('token'));
      setUserRole(getRoleFromToken());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    // Sync on mount in case token was set in this tab
    setHasToken(!!localStorage.getItem('token'));
    setUserRole(getRoleFromToken());
  }, []);

  useEffect(() => {
    // Update when route changes (e.g., after login navigation)
    setHasToken(!!localStorage.getItem('token'));
    setUserRole(getRoleFromToken());
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setHasToken(false);
    setUserRole(null);
    navigate('/');
  };
  return (
    <Container maxW={'1140px'} px={4}>
      <Flex
        h={16}
        alignItems={'center'}
        justifyContent={'space-between'}
        flexDir={{
          base: 'column',
          sm: 'row',
        }}
      >
        <Text
          fontSize={{ base: '22', sm: '28' }}
          fontWeight={'bold'}
          textTransform={'uppercase'}
          textAlign={'center'}
          bgGradient={'linear(to-r, cyan.400, blue.500)'}
          bgClip={'text'}
        >
          <Link to={'/'}>Player List</Link>
        </Text>

        <HStack spacing={2} alignItems={'center'}>
          {userRole === 'admin' && (
            <Link to={'/create'}>
              <Button>
                <PlusSquareIcon fontSize={20} />
              </Button>
            </Link>
          )}

          <Link to={'/paddles'}>
            <Button>
              <SettingsIcon fontSize={20} />
            </Button>
          </Link>
          {hasToken ? (
            <>
              <Link to={'/account'}>
                <Button variant={'outline'}>My Account</Button>
              </Link>
              <Button colorScheme={'red'} onClick={onOpen}>Log Out</Button>
            </>
          ) : (
            <>
              <Link to={'/login'}>
                <Button variant={'outline'}>Login</Button>
              </Link>
              <Link to={'/signup'}>
                <Button colorScheme={'blue'}>Sign Up</Button>
              </Link>
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
    </Container>
  );
};

export default Navbar;
