import React from 'react';
import {
  HStack,
  Button,
  Text,
  IconButton,
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import useCommentStore from '../store/comment';
import { useAuth } from '../hooks/useAuth';

const VoteButtons = ({ comment, targetType, targetId }) => {
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  const { voteComment, loading } = useCommentStore();

  // Check if current user has voted on this comment
  const userVote = comment.votes?.find(vote => vote.user === user?.id);
  const isUpvoted = userVote?.voteType === 'upvote';
  const isDownvoted = userVote?.voteType === 'downvote';

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to vote on comments.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await voteComment(comment._id, voteType);
    } catch (error) {
      toast({
        title: 'Error voting',
        description: error.message || 'Failed to vote on comment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const netScore = (comment.upvotes || 0) - (comment.downvotes || 0);

  if (!isAuthenticated) {
    return (
      <HStack spacing={1}>
        <Tooltip label="Log in to vote">
          <HStack spacing={1}>
            <IconButton
              size="sm"
              variant="ghost"
              icon={<ChevronUpIcon />}
              isDisabled
              color="gray.400"
            />
            <Text fontSize="sm" color="gray.500" minW="20px" textAlign="center">
              {netScore}
            </Text>
            <IconButton
              size="sm"
              variant="ghost"
              icon={<ChevronDownIcon />}
              isDisabled
              color="gray.400"
            />
          </HStack>
        </Tooltip>
      </HStack>
    );
  }

  return (
    <HStack spacing={1}>
      <Tooltip label={isUpvoted ? 'Remove upvote' : 'Upvote'}>
        <IconButton
          size="sm"
          variant="ghost"
          icon={<ChevronUpIcon />}
          color={isUpvoted ? 'green.500' : 'gray.500'}
          bg={isUpvoted ? 'green.50' : 'transparent'}
          _hover={{
            bg: isUpvoted ? 'green.100' : 'gray.100',
            color: isUpvoted ? 'green.600' : 'gray.600'
          }}
          onClick={() => handleVote('upvote')}
          isLoading={loading}
          isDisabled={loading}
        />
      </Tooltip>
      
      <Text 
        fontSize="sm" 
        fontWeight="medium"
        color={netScore > 0 ? 'green.600' : netScore < 0 ? 'red.600' : 'gray.600'}
        minW="20px" 
        textAlign="center"
      >
        {netScore}
      </Text>
      
      <Tooltip label={isDownvoted ? 'Remove downvote' : 'Downvote'}>
        <IconButton
          size="sm"
          variant="ghost"
          icon={<ChevronDownIcon />}
          color={isDownvoted ? 'red.500' : 'gray.500'}
          bg={isDownvoted ? 'red.50' : 'transparent'}
          _hover={{
            bg: isDownvoted ? 'red.100' : 'gray.100',
            color: isDownvoted ? 'red.600' : 'gray.600'
          }}
          onClick={() => handleVote('downvote')}
          isLoading={loading}
          isDisabled={loading}
        />
      </Tooltip>
    </HStack>
  );
};

export default VoteButtons;
