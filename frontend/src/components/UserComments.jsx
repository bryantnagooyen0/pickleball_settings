import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Avatar,
  useToast,
  Spinner,
  Center,
  Link,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
  Textarea,
  Heading,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import useCommentStore from '../store/comment.js';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const UserComments = () => {
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [commentToDelete, setCommentToDelete] = useState(null);
  const cancelRef = React.useRef();
  const toast = useToast();
  
  const { user } = useAuth();
  const {
    updateComment,
    deleteComment,
    fetchUserComments: fetchUserCommentsFromStore,
    clearError,
  } = useCommentStore();

  useEffect(() => {
    const fetchUserComments = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const comments = await fetchUserCommentsFromStore();
        setUserComments(comments);
      } catch (error) {
        console.error('Error fetching user comments:', error);
        setUserComments([]);
      }
    };

    fetchUserComments();
  }, [user?.id, fetchUserCommentsFromStore]);

  useEffect(() => {
    setLoading(false);
  }, [userComments]);

  const fetchUserComments = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const comments = await fetchUserCommentsFromStore();
      setUserComments(comments);
    } catch (error) {
      console.error('Error fetching user comments:', error);
      setUserComments([]);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await updateComment(editingComment, editContent.trim());
      setEditingComment(null);
      setEditContent('');
      
      // Refresh user comments after successful update
      await fetchUserComments();
      
      toast({
        title: 'Success',
        description: 'Comment updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    onOpen();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteComment(commentToDelete._id);
      onClose();
      setCommentToDelete(null);
      
      // Refresh user comments after successful delete
      await fetchUserComments();
      
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTargetLink = (comment) => {
    if (comment.targetType === 'player') {
      return `/player/${comment.targetId}`;
    } else if (comment.targetType === 'paddle') {
      return `/paddle/${comment.targetId}`;
    }
    return '#';
  };

  const getTargetName = (comment) => {
    // This would need to be populated from the comment data
    // For now, we'll show a generic name
    return comment.targetType === 'player' ? 'Player' : 'Paddle';
  };

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="lg" color="var(--color-primary)" />
      </Center>
    );
  }

  if (userComments.length === 0) {
    return (
      <Box 
        textAlign="center" 
        py={12} 
        color="var(--color-text-secondary)"
        sx={{
          '--color-text-secondary': '#666666',
          '--font-body': '"Inter", sans-serif',
        }}
      >
        <Text
          fontFamily="var(--font-body)"
          fontSize="md"
          mb={2}
        >
          You haven't posted any comments yet.
        </Text>
        <Text 
          fontSize="sm"
          fontFamily="var(--font-body)"
        >
          Start commenting on players and paddles to see them here!
        </Text>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        '--color-primary': '#2C5F7C',
        '--color-accent': '#FF6B6B',
        '--color-bg': '#FAF9F6',
        '--font-display': '"Merriweather", serif',
        '--font-body': '"Inter", sans-serif',
        '--color-text-primary': '#1A1A1A',
        '--color-text-secondary': '#666666',
      }}
    >
      <Heading
        as="h3"
        fontSize={{ base: 'xl', md: '2xl' }}
        fontFamily="var(--font-display)"
        fontWeight={700}
        color="var(--color-text-primary)"
        mb={6}
      >
        My Comments ({userComments.length})
      </Heading>

      <VStack align="stretch" spacing={4}>
        {userComments.map((comment, index) => (
          <MotionBox
            key={comment._id}
            p={5}
            border="none"
            borderRadius={0}
            bg="white"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
          >
            <HStack justify="space-between" align="flex-start" mb={3}>
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={comment.authorName}
                  bg="var(--color-primary)"
                  color="white"
                  fontFamily="var(--font-body)"
                  fontWeight={600}
                />
                <VStack align="flex-start" spacing={0}>
                  <Text 
                    fontWeight={600} 
                    fontSize="sm"
                    fontFamily="var(--font-body)"
                    color="var(--color-text-primary)"
                  >
                    {comment.authorName}
                  </Text>
                  <HStack spacing={2}>
                    <Text 
                      fontSize="xs" 
                      color="var(--color-text-secondary)"
                      fontFamily="var(--font-body)"
                    >
                      {formatDate(comment.createdAt)}
                    </Text>
                    {comment.updatedAt !== comment.createdAt && (
                      <Badge 
                        px={2} 
                        py={0.5} 
                        borderRadius="full"
                        bg="var(--color-bg)"
                        color="var(--color-text-secondary)"
                        fontSize="2xs"
                        fontFamily="var(--font-body)"
                        fontWeight={500}
                      >
                        edited
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>

              <HStack spacing={1}>
                {editingComment === comment._id ? (
                  <>
                    <Tooltip label="Save">
                      <Button
                        size="sm"
                        px={3}
                        bg="var(--color-primary)"
                        color="white"
                        variant="solid"
                        onClick={handleSaveEdit}
                        borderRadius="full"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                        fontSize="xs"
                        _hover={{
                          bg: "var(--color-accent)",
                        }}
                        transition="all 0.3s ease"
                      >
                        Save
                      </Button>
                    </Tooltip>
                    <Tooltip label="Cancel">
                      <Button
                        size="sm"
                        px={3}
                        variant="outline"
                        border="1px solid"
                        borderColor="rgba(0, 0, 0, 0.1)"
                        borderRadius="full"
                        color="var(--color-text-secondary)"
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                        fontSize="xs"
                        onClick={handleCancelEdit}
                        _hover={{
                          bg: "var(--color-bg)",
                          borderColor: "var(--color-text-primary)",
                          color: "var(--color-text-primary)",
                        }}
                        transition="all 0.3s ease"
                      >
                        Cancel
                      </Button>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip label="Edit">
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        bg="transparent"
                        color="var(--color-primary)"
                        variant="ghost"
                        onClick={() => handleEditComment(comment)}
                        _hover={{
                          bg: "var(--color-bg)",
                          color: "var(--color-accent)",
                        }}
                        transition="all 0.3s ease"
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        bg="transparent"
                        color="var(--color-accent)"
                        variant="ghost"
                        onClick={() => handleDeleteClick(comment)}
                        _hover={{
                          bg: "var(--color-bg)",
                          opacity: 0.8,
                        }}
                        transition="all 0.3s ease"
                      />
                    </Tooltip>
                  </>
                )}
              </HStack>
            </HStack>

            {editingComment === comment._id ? (
              <VStack align="stretch" spacing={2}>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  resize="vertical"
                  maxLength={1000}
                  bg="white"
                  border="1px solid"
                  borderColor="rgba(0, 0, 0, 0.1)"
                  borderRadius={0}
                  fontFamily="var(--font-body)"
                  color="var(--color-text-primary)"
                  _focus={{
                    borderColor: "var(--color-primary)",
                    boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                    outline: "none",
                  }}
                />
                <Text 
                  fontSize="xs" 
                  color="var(--color-text-secondary)"
                  fontFamily="var(--font-body)"
                >
                  {editContent.length}/1000 characters
                </Text>
              </VStack>
            ) : (
              <Text 
                whiteSpace="pre-wrap" 
                fontSize="sm"
                fontFamily="var(--font-body)"
                color="var(--color-text-primary)"
                lineHeight="1.6"
                mb={3}
              >
                {comment.content}
              </Text>
            )}

            {/* Comment context */}
            <HStack spacing={2} mt={3} pt={3} borderTop="1px solid" borderColor="rgba(0, 0, 0, 0.05)">
              <Link
                href={`${getTargetLink(comment)}#comment-${comment._id}`}
                color="var(--color-primary)"
                fontSize="xs"
                fontFamily="var(--font-body)"
                fontWeight={600}
                _hover={{ 
                  color: "var(--color-accent)",
                  textDecoration: "none",
                }}
                transition="all 0.3s ease"
              >
                View Comment
                <ExternalLinkIcon ml={1} boxSize={3} />
              </Link>
            </HStack>
          </MotionBox>
        ))}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            sx={{
              '--font-display': '"Merriweather", serif',
              '--font-body': '"Inter", sans-serif',
              '--color-primary': '#2C5F7C',
              '--color-accent': '#FF6B6B',
            }}
            borderRadius={0}
            border="1px solid"
            borderColor="rgba(0, 0, 0, 0.1)"
          >
            <AlertDialogHeader 
              fontSize="lg" 
              fontWeight={700}
              fontFamily="var(--font-display)"
            >
              Delete Comment
            </AlertDialogHeader>

            <AlertDialogBody
              fontFamily="var(--font-body)"
            >
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={onClose}
                variant="outline"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.1)"
                borderRadius="full"
                fontFamily="var(--font-body)"
                fontWeight={600}
                _hover={{
                  bg: "var(--color-bg)",
                }}
                transition="all 0.3s ease"
              >
                Cancel
              </Button>
              <Button
                bg="var(--color-accent)"
                color="white"
                onClick={handleConfirmDelete}
                ml={3}
                borderRadius="full"
                fontFamily="var(--font-body)"
                fontWeight={600}
                _hover={{
                  bg: "var(--color-primary)",
                }}
                transition="all 0.3s ease"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UserComments;
