import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  InputGroup,
  InputLeftElement,
  Image,
  Badge,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { usePaddleStore } from '../store/paddle';

const PaddleSelector = ({ 
  selectedPaddle, 
  onPaddleSelect, 
  onPaddleDataChange,
  showCreateButton = true 
}) => {
  const { paddles, fetchPaddles, searchPaddles } = usePaddleStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchPaddles();
  }, [fetchPaddles]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(paddles);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchPaddles(searchQuery);
      if (result.success) {
        setSearchResults(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePaddleSelect = (paddle) => {
    onPaddleSelect(paddle);
    
    // Auto-fill paddle data
    onPaddleDataChange({
      paddle: paddle.name,
      paddleBrand: paddle.brand || '',
      paddleModel: paddle.model || '',
      paddleShape: paddle.shape || '',
      paddleThickness: paddle.thickness || '',
      paddleHandleLength: paddle.handleLength || '',
      paddleLength: paddle.length || '',
      paddleWidth: paddle.width || '',
      paddleImage: paddle.image || '',
      paddleCore: paddle.core || ''
    });
    
    onClose();
  };

  const displayPaddles = searchQuery ? searchResults : paddles;

  return (
    <>
      <Box>
        <HStack spacing={2}>
          <Input
            placeholder="Search or select paddle..."
            value={selectedPaddle ? selectedPaddle.name : ''}
            onClick={onOpen}
            readOnly
            cursor="pointer"
          />
          {showCreateButton && (
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              onClick={() => window.open('/paddles', '_blank')}
              title="Create new paddle template"
            >
              New
            </Button>
          )}
        </HStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Paddle</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search paddles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
              
              <Button 
                colorScheme="blue" 
                onClick={handleSearch}
                isLoading={isSearching}
                w="full"
              >
                Search
              </Button>

              <Divider />

              <VStack spacing={2} maxH="400px" overflowY="auto" w="full">
                {displayPaddles.map(paddle => (
                  <Box
                    key={paddle._id}
                    w="full"
                    p={4}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{
                      bg: "gray.50",
                      borderColor: "blue.300"
                    }}
                    onClick={() => handlePaddleSelect(paddle)}
                  >
                    <HStack spacing={4} align="start">
                      {paddle.image && (
                        <Image
                          src={paddle.image}
                          alt={paddle.name}
                          borderRadius="md"
                          w="60px"
                          h="60px"
                          objectFit="cover"
                        />
                      )}
                      
                      <VStack align="start" flex={1} spacing={1}>
                        <Text fontWeight="bold" fontSize="md">
                          {paddle.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {paddle.brand} - {paddle.model}
                        </Text>
                        
                        <HStack spacing={2} flexWrap="wrap">
                          {paddle.shape && (
                            <Badge size="sm" colorScheme="blue" variant="subtle">
                              {paddle.shape}
                            </Badge>
                          )}
                          {paddle.thickness && (
                            <Badge size="sm" colorScheme="green" variant="subtle">
                              {paddle.thickness}
                            </Badge>
                          )}
                          {paddle.weight && (
                            <Badge size="sm" colorScheme="purple" variant="subtle">
                              {paddle.weight}
                            </Badge>
                          )}
                        </HStack>

                        {paddle.description && (
                          <Text fontSize="xs" color="gray.500" noOfLines={2}>
                            {paddle.description}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              {displayPaddles.length === 0 && (
                <Text textAlign="center" color="gray.500">
                  {searchQuery ? 'No paddles found matching your search' : 'No paddles available'}
                </Text>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PaddleSelector;
