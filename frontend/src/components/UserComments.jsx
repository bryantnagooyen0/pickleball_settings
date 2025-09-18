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
  Divider,
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
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth.js';
import useCommentStore from '../store/comment.js';

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
  }, [user?.id]);

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
        <Spinner size="lg" />
      </Center>
    );
  }

  if (userComments.length === 0) {
    return (
      <Box textAlign="center" py={8} color="gray.500">
        <Text>You haven't posted any comments yet.</Text>
        <Text fontSize="sm" mt={2}>
          Start commenting on players and paddles to see them here!
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        My Comments ({userComments.length})
      </Text>

      <VStack align="stretch" spacing={4}>
        {userComments.map((comment) => (
          <Box
            key={comment._id}
            p={4}
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            bg="white"
          >
            <HStack justify="space-between" align="flex-start" mb={2}>
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={comment.authorName}
                  bg="blue.500"
                  color="white"
                />
                <VStack align="flex-start" spacing={0}>
                  <Text fontWeight="semibold" fontSize="sm">
                    {comment.authorName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {formatDate(comment.createdAt)}
                    {comment.updatedAt !== comment.createdAt && (
                      <Badge ml={2} size="sm" colorScheme="gray">
                        edited
                      </Badge>
                    )}
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={1}>
                {editingComment === comment._id ? (
                  <>
                    <Tooltip label="Save">
                      <Button
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        onClick={handleSaveEdit}
                      >
                        Save
                      </Button>
                    </Tooltip>
                    <Tooltip label="Cancel">
                      <Button
                        size="sm"
                        colorScheme="gray"
                        variant="ghost"
                        onClick={handleCancelEdit}
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
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEditComment(comment)}
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteClick(comment)}
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
                />
                <Text fontSize="sm" color="gray.500">
                  {editContent.length}/1000 characters
                </Text>
              </VStack>
            ) : (
              <Text whiteSpace="pre-wrap" fontSize="sm" mb={2}>
                {comment.content}
              </Text>
            )}

            {/* Comment context */}
            <HStack spacing={2} mt={2}>
              <Link
                href={`${getTargetLink(comment)}#comment-${comment._id}`}
                color="blue.500"
                fontSize="sm"
                _hover={{ textDecoration: 'underline' }}
              >
                View Comment
                <ExternalLinkIcon ml={1} boxSize={3} />
              </Link>
            </HStack>
          </Box>
        ))}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Comment
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
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
