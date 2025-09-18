import React, { useState } from 'react';
import {
  Button,
  Textarea,
  HStack,
  VStack,
  Box,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text
} from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import useCommentStore from '../store/comment';

const ReplyButton = ({ comment, targetType, targetId, onReply }) => {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { createComment } = useCommentStore();

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: 'Reply cannot be empty',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (replyContent.length > 1000) {
      toast({
        title: 'Reply too long',
        description: 'Replies must be 1000 characters or less',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createComment(replyContent, targetType, targetId, comment._id);
      
      toast({
        title: 'Reply posted',
        description: 'Your reply has been added to the conversation',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setReplyContent('');
      onClose();
      
      if (onReply) {
        onReply();
      }
    } catch (error) {
      toast({
        title: 'Error posting reply',
        description: error.message || 'Failed to post reply. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReplyContent('');
    onClose();
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        leftIcon={<ChatIcon />}
        onClick={onOpen}
        color="blue.500"
        _hover={{ bg: 'blue.50' }}
      >
        Reply
      </Button>

      <Modal isOpen={isOpen} onClose={handleCancel} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reply to Comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Original comment context */}
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Replying to {comment.author?.username || comment.authorName}:
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {comment.content}
                </Text>
              </Box>

              {/* Reply textarea */}
              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">
                  Your reply:
                </Text>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                  resize="vertical"
                  maxLength={1000}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {replyContent.length}/1000 characters
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleReply}
              isLoading={isSubmitting}
              loadingText="Posting..."
              isDisabled={!replyContent.trim()}
            >
              Post Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReplyButton;
