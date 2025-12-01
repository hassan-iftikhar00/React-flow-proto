/**
 * Comment Storage Utilities
 * Handles localStorage operations for node comments
 */

// Get all comments for a specific flow
export const getFlowComments = (flowId) => {
  if (!flowId) return [];
  const key = `flow_${flowId}_comments`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

// Save comments for a specific flow
export const saveFlowComments = (flowId, comments) => {
  if (!flowId) return;
  const key = `flow_${flowId}_comments`;
  localStorage.setItem(key, JSON.stringify(comments));
};

// Get comments for a specific node
export const getNodeComments = (flowId, nodeId) => {
  const allComments = getFlowComments(flowId);
  return allComments.filter((comment) => comment.nodeId === nodeId);
};

// Add a new comment
export const addComment = (flowId, comment) => {
  const comments = getFlowComments(flowId);
  const newComment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...comment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replies: [],
  };
  comments.push(newComment);
  saveFlowComments(flowId, comments);
  return newComment;
};

// Add a reply to a comment
export const addReply = (flowId, commentId, reply) => {
  const comments = getFlowComments(flowId);
  const updatedComments = comments.map((comment) => {
    if (comment.id === commentId) {
      const newReply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...reply,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
        updatedAt: new Date().toISOString(),
      };
    }
    return comment;
  });
  saveFlowComments(flowId, updatedComments);
  return updatedComments.find((c) => c.id === commentId);
};

// Update a comment
export const updateComment = (flowId, commentId, updates) => {
  const comments = getFlowComments(flowId);
  const updatedComments = comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
    return comment;
  });
  saveFlowComments(flowId, updatedComments);
  return updatedComments.find((c) => c.id === commentId);
};

// Delete a comment
export const deleteComment = (flowId, commentId) => {
  const comments = getFlowComments(flowId);
  const filteredComments = comments.filter((c) => c.id !== commentId);
  saveFlowComments(flowId, filteredComments);
};

// Delete a reply
export const deleteReply = (flowId, commentId, replyId) => {
  const comments = getFlowComments(flowId);
  const updatedComments = comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        replies: comment.replies.filter((r) => r.id !== replyId),
        updatedAt: new Date().toISOString(),
      };
    }
    return comment;
  });
  saveFlowComments(flowId, updatedComments);
};

// Get comment count for a node
export const getNodeCommentCount = (flowId, nodeId) => {
  const nodeComments = getNodeComments(flowId, nodeId);
  // Count main comments + replies
  return nodeComments.reduce((count, comment) => {
    return count + 1 + (comment.replies?.length || 0);
  }, 0);
};

// Parse @mentions from text
export const parseMentions = (text) => {
  const mentionRegex = /@(\w+(?:\.\w+)?)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // Extract username without @
  }
  return [...new Set(mentions)]; // Remove duplicates
};

// Highlight @mentions in text (returns HTML string)
export const highlightMentions = (text) => {
  return text.replace(/@(\w+(?:\.\w+)?)/g, '<span class="mention">@$1</span>');
};

// Get all users mentioned in a comment
export const getMentionedUsers = (text) => {
  return parseMentions(text);
};

// Check if user is mentioned in comment
export const isUserMentioned = (text, userId) => {
  const mentions = parseMentions(text);
  return mentions.includes(userId);
};
