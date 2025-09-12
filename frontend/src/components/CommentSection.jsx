import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  Avatar,
  Badge,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Spinner,
  Divider,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';
import useCommentStore from '../store/comment.js';
import { useAuth } from '../hooks/useAuth.js';

const CommentSection = ({ targetType, targetId }) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [commentToDelete, setCommentToDelete] = useState(null);
  const cancelRef = React.useRef();
  const toast = useToast();
  
  const { isAuthenticated, user } = useAuth();
  const {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    getComments,
    clearError,
  } = useCommentStore();

  const targetComments = getComments(targetType, targetId);

  useEffect(() => {
    if (targetId) {
      fetchComments(targetType, targetId);
    }
  }, [targetType, targetId, fetchComments]);

  // Handle scrolling to comment when page loads with anchor
  useEffect(() => {
    const handleScrollToComment = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#comment-')) {
        const commentId = hash.replace('#comment-', '');
        const commentElement = document.getElementById(`comment-${commentId}`);
        if (commentElement) {
          // Immediate scroll since comments are already loaded
          commentElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Highlight the comment briefly
          commentElement.style.backgroundColor = '#fef3c7';
          setTimeout(() => {
            commentElement.style.backgroundColor = '';
          }, 2000);
        } else {
          // If comment not found yet, try again after a short delay
          setTimeout(() => {
            const retryElement = document.getElementById(`comment-${commentId}`);
            if (retryElement) {
              retryElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
              retryElement.style.backgroundColor = '#fef3c7';
              setTimeout(() => {
                retryElement.style.backgroundColor = '';
              }, 2000);
            }
          }, 100);
        }
      }
    };

    // Check for anchor on component mount
    handleScrollToComment();

    // Also listen for hash changes (in case user navigates with anchor)
    window.addEventListener('hashchange', handleScrollToComment);
    
    return () => {
      window.removeEventListener('hashchange', handleScrollToComment);
    };
  }, [targetComments]); // Re-run when comments are loaded

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await createComment(newComment.trim(), targetType, targetId);
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Error is handled by the store and useEffect
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
      toast({
        title: 'Success',
        description: 'Comment updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Error is handled by the store and useEffect
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
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Error is handled by the store and useEffect
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

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Comments ({targetComments.length})
      </Text>

      {/* Add Comment Form */}
      {isAuthenticated && (
        <Box mb={6}>
          <VStack align="stretch" spacing={3}>
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              resize="vertical"
              maxLength={1000}
            />
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                {newComment.length}/1000 characters
              </Text>
              <Button
                colorScheme="blue"
                onClick={handleSubmitComment}
                isLoading={loading}
                loadingText="Posting..."
                size="sm"
              >
                Post Comment
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {!isAuthenticated && (
        <Box mb={6} p={4} bg="gray.50" borderRadius="md">
          <Text color="gray.600">
            Please log in to leave a comment.
          </Text>
        </Box>
      )}

      <Divider mb={4} />

      {/* Comments List */}
      {loading && targetComments.length === 0 ? (
        <Flex justify="center" py={8}>
          <Spinner size="lg" />
        </Flex>
      ) : targetComments.length === 0 ? (
        <Box textAlign="center" py={8} color="gray.500">
          <Text>No comments yet. Be the first to comment!</Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={4}>
          {targetComments.map((comment) => (
            <Box
              key={comment._id}
              id={`comment-${comment._id}`}
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

                {isAuthenticated && user?.id === comment.author?._id && (
                  <HStack spacing={1}>
                    {editingComment === comment._id ? (
                      <>
                        <Tooltip label="Save">
                          <IconButton
                            icon={<CheckIcon />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={handleSaveEdit}
                            isLoading={loading}
                          />
                        </Tooltip>
                        <Tooltip label="Cancel">
                          <IconButton
                            icon={<CloseIcon />}
                            size="sm"
                            colorScheme="gray"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          />
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
                )}
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
                <Text whiteSpace="pre-wrap" fontSize="sm">
                  {comment.content}
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      )}

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
                isLoading={loading}
                loadingText="Deleting..."
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

export default CommentSection;
