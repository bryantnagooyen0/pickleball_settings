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
  Heading,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';
import useCommentStore from '../store/comment.js';
import { useAuth } from '../hooks/useAuth.js';
import ReplyButton from './ReplyButton.jsx';
import VoteButtons from './VoteButtons.jsx';

// Recursive CommentItem component for threaded comments
const CommentItem = ({ comment, targetType, targetId, depth = 0, onRefresh }) => {
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [commentToDelete, setCommentToDelete] = useState(null);
  const cancelRef = React.useRef();
  const toast = useToast();
  
  const { isAuthenticated, user } = useAuth();
  const { updateComment, deleteComment, loading } = useCommentStore();

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
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (onRefresh) onRefresh();
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

  return (
    <>
      <Box
        id={`comment-${comment._id}`}
        p={5}
        border="none"
        borderRadius={0}
        bg="white"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
        ml={depth > 0 ? '24px' : '0'}
        borderLeft={depth > 0 ? '3px solid' : 'none'}
        borderLeftColor={depth > 0 ? 'var(--color-primary)' : 'transparent'}
        sx={{
          '--color-primary': '#2C5F7C',
          '--color-accent': '#FF6B6B',
          '--font-display': '"Merriweather", serif',
          '--font-body': '"Inter", sans-serif',
          '--color-text-primary': '#1A1A1A',
          '--color-text-secondary': '#666666',
        }}
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

          {isAuthenticated && user?.id === comment.author?._id && (
            <HStack spacing={1}>
              {editingComment === comment._id ? (
                <>
                  <Tooltip label="Save">
                    <IconButton
                      icon={<CheckIcon />}
                      size="sm"
                      bg="transparent"
                      color="var(--color-primary)"
                      variant="ghost"
                      onClick={handleSaveEdit}
                      isLoading={loading}
                      _hover={{
                        bg: "var(--color-bg)",
                        color: "var(--color-accent)",
                      }}
                      transition="all 0.3s ease"
                    />
                  </Tooltip>
                  <Tooltip label="Cancel">
                    <IconButton
                      icon={<CloseIcon />}
                      size="sm"
                      bg="transparent"
                      color="var(--color-text-secondary)"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      _hover={{
                        bg: "var(--color-bg)",
                        color: "var(--color-text-primary)",
                      }}
                      transition="all 0.3s ease"
                    />
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
          >
            {comment.content}
          </Text>
        )}

        {/* Vote buttons and reply button */}
        <HStack mt={4} spacing={4} justify="space-between">
          <VoteButtons 
            comment={comment} 
            targetType={targetType} 
            targetId={targetId}
          />
          
          {isAuthenticated && (
            <ReplyButton 
              comment={comment} 
              targetType={targetType} 
              targetId={targetId}
              onReply={onRefresh}
            />
          )}
        </HStack>

        {/* Don't render replies here - they'll be rendered at the same level */}
      </Box>

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
                isLoading={loading}
                loadingText="Deleting..."
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
    </>
  );
};

const CommentSection = ({ targetType, targetId }) => {
  const [newComment, setNewComment] = useState('');
  const toast = useToast();
  
  const { isAuthenticated } = useAuth();
  const {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    getComments,
    clearError,
  } = useCommentStore();

  const targetComments = getComments(targetType, targetId);

  // Function to flatten all replies recursively
  const flattenReplies = (comment, depth = 0) => {
    const result = [];
    result.push({ ...comment, depth });
    
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach(reply => {
        result.push(...flattenReplies(reply, 1)); // All replies are depth 1
      });
    }
    
    return result;
  };

  // Flatten all comments and their replies
  const flattenedComments = targetComments.flatMap(comment => flattenReplies(comment));

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
        Comments ({targetComments.length})
      </Heading>

      {/* Add Comment Form */}
      {isAuthenticated && (
        <Box mb={8}>
          <VStack align="stretch" spacing={4}>
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              resize="vertical"
              maxLength={1000}
              bg="white"
              border="1px solid"
              borderColor="rgba(0, 0, 0, 0.1)"
              borderRadius={0}
              fontFamily="var(--font-body)"
              color="var(--color-text-primary)"
              _placeholder={{
                color: "var(--color-text-secondary)",
                opacity: 0.5,
              }}
              _focus={{
                borderColor: "var(--color-primary)",
                boxShadow: "0 0 0 3px rgba(44, 95, 124, 0.1)",
                outline: "none",
              }}
            />
            <HStack justify="space-between">
              <Text 
                fontSize="xs" 
                color="var(--color-text-secondary)"
                fontFamily="var(--font-body)"
              >
                {newComment.length}/1000 characters
              </Text>
              <Button
                bg="var(--color-primary)"
                color="white"
                onClick={handleSubmitComment}
                isLoading={loading}
                loadingText="Posting..."
                size="md"
                px={6}
                borderRadius="full"
                fontFamily="var(--font-body)"
                fontWeight={600}
                _hover={{
                  bg: "var(--color-accent)",
                }}
                transition="all 0.3s ease"
              >
                Post Comment
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {!isAuthenticated && (
        <Box 
          mb={8} 
          p={5} 
          bg="var(--color-bg)" 
          borderRadius={0}
          border="1px solid"
          borderColor="rgba(0, 0, 0, 0.05)"
        >
          <Text 
            color="var(--color-text-secondary)"
            fontFamily="var(--font-body)"
          >
            Please log in to leave a comment.
          </Text>
        </Box>
      )}

      <Divider 
        mb={6} 
        borderColor="rgba(0, 0, 0, 0.08)"
      />

      {/* Comments List */}
      {loading && targetComments.length === 0 ? (
        <VStack align="stretch" spacing={4}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              p={5}
              border="none"
              borderRadius={0}
              bg="white"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
            >
              <HStack justify="space-between" align="flex-start" mb={2}>
                <HStack spacing={3}>
                  <Box w="32px" h="32px" bg="var(--color-bg)" borderRadius="full" />
                  <VStack align="flex-start" spacing={1}>
                    <Box w="100px" h="16px" bg="var(--color-bg)" borderRadius="sm" />
                    <Box w="80px" h="12px" bg="var(--color-bg)" borderRadius="sm" />
                  </VStack>
                </HStack>
              </HStack>
              <Box w="full" h="60px" bg="var(--color-bg)" borderRadius="sm" />
            </Box>
          ))}
        </VStack>
      ) : targetComments.length === 0 ? (
        <Box 
          textAlign="center" 
          py={12} 
          color="var(--color-text-secondary)"
        >
          <Text
            fontFamily="var(--font-body)"
            fontSize="md"
          >
            No comments yet. Be the first to comment!
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={4}>
          {flattenedComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              targetType={targetType}
              targetId={targetId}
              depth={comment.depth}
              onRefresh={() => fetchComments(targetType, targetId)}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default CommentSection;
