import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  Link,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import useCommentStore from '../store/comment';

// Recursive AdminCommentItem component for threaded comments
const AdminCommentItem = ({ comment, onDelete, onRefresh, depth = 0 }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    if (comment.targetType === 'player') {
      return 'Player';
    } else if (comment.targetType === 'paddle') {
      return 'Paddle';
    }
    return 'Unknown';
  };

  return (
    <Box
      p={4}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      bg="white"
      ml={depth > 0 ? `${depth * 4}px` : '0'}
      borderLeft={depth > 0 ? '3px solid' : 'none'}
      borderLeftColor={depth > 0 ? 'blue.200' : 'transparent'}
    >
      <VStack align="stretch" spacing={3}>
        {/* Comment Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <HStack spacing={2}>
              <Text fontWeight="semibold" fontSize="sm">
                {comment.author?.username || 'Unknown User'}
              </Text>
              <Badge colorScheme={comment.author?.role === 'admin' ? 'red' : 'blue'} size="sm">
                {comment.author?.role || 'user'}
              </Badge>
              {depth > 0 && (
                <Badge colorScheme="green" size="sm">
                  Reply
                </Badge>
              )}
            </HStack>
            <Text fontSize="xs" color="gray.500">
              {formatDate(comment.createdAt)}
            </Text>
          </VStack>
          
          <HStack spacing={2}>
            <Tooltip label={`View ${getTargetName(comment)}`}>
              <Button
                size="xs"
                variant="ghost"
                as={Link}
                href={getTargetLink(comment)}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<ExternalLinkIcon />}
              >
                View {getTargetName(comment)}
              </Button>
            </Tooltip>
            
            <Tooltip label="Delete comment">
              <Button
                size="xs"
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete(comment)}
                leftIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </Tooltip>
          </HStack>
        </HStack>

        <Divider />

        {/* Comment Content */}
        <Text fontSize="sm" whiteSpace="pre-wrap">
          {comment.content}
        </Text>

        {/* Target Info */}
        <HStack spacing={2} fontSize="xs" color="gray.600">
          <Badge colorScheme="gray" variant="outline">
            {comment.targetType}
          </Badge>
          <Text>ID: {comment.targetId}</Text>
          {comment.parentComment && (
            <Badge colorScheme="purple" variant="outline">
              Reply to: {comment.parentComment.authorName || 'Unknown'}
            </Badge>
          )}
        </HStack>

        {/* Render replies recursively */}
        {comment.replies && comment.replies.length > 0 && (
          <VStack align="stretch" spacing={2} mt={3}>
            {comment.replies.map((reply) => (
              <AdminCommentItem
                key={reply._id}
                comment={reply}
                onDelete={onDelete}
                onRefresh={onRefresh}
                depth={depth + 1}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

const AdminComments = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [commentToDelete, setCommentToDelete] = React.useState(null);

  const {
    adminComments,
    adminLoading,
    adminError,
    fetchAllComments,
    adminDeleteComment,
    clearAdminError
  } = useCommentStore();

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;

    try {
      await adminDeleteComment(commentToDelete._id);
      toast({
        title: 'Comment deleted',
        description: 'The comment has been permanently deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setCommentToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    if (comment.targetType === 'player') {
      return 'Player';
    } else if (comment.targetType === 'paddle') {
      return 'Paddle';
    }
    return 'Unknown';
  };

  if (adminLoading) {
    return (
      <Center py={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (adminError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Error loading comments!</AlertTitle>
          <AlertDescription>
            {adminError}
            <Button size="sm" ml={4} onClick={() => {
              clearAdminError();
              fetchAllComments();
            }}>
              Retry
            </Button>
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (adminComments.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No comments found.</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Recent Comments ({adminComments.length})
        </Text>
        <Button size="sm" onClick={() => fetchAllComments()}>
          Refresh
        </Button>
      </HStack>

      {adminComments.map((comment, index) => (
        <AdminCommentItem
          key={comment._id}
          comment={comment}
          onDelete={handleDeleteClick}
          onRefresh={fetchAllComments}
        />
      ))}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to permanently delete this comment? This action cannot be undone.
            </Text>
            {commentToDelete && (
              <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="semibold">
                  Comment by {commentToDelete.author?.username}:
                </Text>
                <Text fontSize="sm" mt={1} color="gray.600">
                  {commentToDelete.content}
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default AdminComments;
