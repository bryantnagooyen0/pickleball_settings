import { create } from 'zustand';
import { api } from '../utils/api.js';

const useCommentStore = create((set, get) => ({
  comments: {},
  loading: false,
  error: null,

  // Get comments for a specific target
  fetchComments: async (targetType, targetId) => {
    const key = `${targetType}-${targetId}`;
    
    set({ loading: true, error: null });
    
    try {
      const response = await api.get(`/api/comments/${targetType}/${targetId}`);
      
      if (response.success) {
        set(state => ({
          comments: {
            ...state.comments,
            [key]: response.data
          },
          loading: false
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch comments');
      }
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch comments',
        loading: false 
      });
      throw error;
    }
  },

  // Create a new comment
  createComment: async (content, targetType, targetId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post('/api/comments', {
        content,
        targetType,
        targetId
      });
      
      if (response.success) {
        const key = `${targetType}-${targetId}`;
        set(state => ({
          comments: {
            ...state.comments,
            [key]: [response.data, ...(state.comments[key] || [])]
          },
          loading: false
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create comment');
      }
    } catch (error) {
      set({ 
        error: error.message || 'Failed to create comment',
        loading: false 
      });
      throw error;
    }
  },

  // Update a comment
  updateComment: async (commentId, content) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.put(`/api/comments/${commentId}`, { content });
      
      if (response.success) {
        // Update the comment in all relevant comment arrays
        set(state => {
          const newComments = { ...state.comments };
          
          Object.keys(newComments).forEach(key => {
            newComments[key] = newComments[key].map(comment => 
              comment._id === commentId ? response.data : comment
            );
          });
          
          return {
            comments: newComments,
            loading: false
          };
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update comment');
      }
    } catch (error) {
      set({ 
        error: error.message || 'Failed to update comment',
        loading: false 
      });
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.delete(`/api/comments/${commentId}`);
      
      if (response.success) {
        // Remove the comment from all relevant comment arrays
        set(state => {
          const newComments = { ...state.comments };
          
          Object.keys(newComments).forEach(key => {
            newComments[key] = newComments[key].filter(comment => 
              comment._id !== commentId
            );
          });
          
          return {
            comments: newComments,
            loading: false
          };
        });
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete comment');
      }
    } catch (error) {
      set({ 
        error: error.message || 'Failed to delete comment',
        loading: false 
      });
      throw error;
    }
  },

  // Get comments for a specific target from store
  getComments: (targetType, targetId) => {
    const key = `${targetType}-${targetId}`;
    return get().comments[key] || [];
  },

  // Clear comments for a specific target
  clearComments: (targetType, targetId) => {
    const key = `${targetType}-${targetId}`;
    set(state => {
      const newComments = { ...state.comments };
      delete newComments[key];
      return { comments: newComments };
    });
  },

  // Clear all comments
  clearAllComments: () => {
    set({ comments: {} });
  },

  // Get user's own comments
  fetchUserComments: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get('/api/comments/user/my-comments');
      
      if (response.success) {
        set({ loading: false });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user comments');
      }
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch user comments',
        loading: false 
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useCommentStore;
