import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers } from "../auth/users";
import {
  getNodeComments,
  addComment,
  addReply,
  deleteComment,
  deleteReply,
  parseMentions,
} from "../utils/commentStorage";
import {
  MessageCircle,
  Send,
  Reply,
  Trash2,
  User,
  Clock,
  AtSign,
} from "lucide-react";
import "./CommentsPanel.css";

export default function CommentsPanel({ flowId, nodeId, nodeName }) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const inputRef = useRef(null);
  const replyInputRef = useRef(null);
  const allUsers = getAllUsers();

  useEffect(() => {
    loadComments();
  }, [flowId, nodeId]);

  const loadComments = () => {
    const nodeComments = getNodeComments(flowId, nodeId);
    // Sort by newest first
    setComments(
      nodeComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  };

  const handleInputChange = (e, isReply = false) => {
    const text = e.target.value;
    if (isReply) {
      setReplyText(text);
    } else {
      setNewCommentText(text);
    }

    // Check for @mention
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
      if (!textAfterAt.includes(" ")) {
        setMentionQuery(textAfterAt.toLowerCase());
        setMentionPosition(lastAtSymbol);
        setShowMentionSuggestions(true);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const handleMentionSelect = (user, isReply = false) => {
    const text = isReply ? replyText : newCommentText;
    const beforeMention = text.substring(0, mentionPosition);
    const afterMention = text.substring(
      mentionPosition + mentionQuery.length + 1
    );
    const newText = `${beforeMention}@${user.id} ${afterMention}`;

    if (isReply) {
      setReplyText(newText);
      replyInputRef.current?.focus();
    } else {
      setNewCommentText(newText);
      inputRef.current?.focus();
    }
    setShowMentionSuggestions(false);
  };

  const filteredUsers = showMentionSuggestions
    ? allUsers.filter(
        (user) =>
          user.id.toLowerCase().includes(mentionQuery) ||
          user.name.toLowerCase().includes(mentionQuery)
      )
    : [];

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    const mentions = parseMentions(newCommentText);
    const newComment = addComment(flowId, {
      nodeId,
      text: newCommentText,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      mentions,
    });

    setNewCommentText("");
    loadComments();
  };

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;

    const mentions = parseMentions(replyText);
    addReply(flowId, commentId, {
      text: replyText,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      mentions,
    });

    setReplyText("");
    setReplyingTo(null);
    loadComments();
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Delete this comment?")) {
      deleteComment(flowId, commentId);
      loadComments();
    }
  };

  const handleDeleteReply = (commentId, replyId) => {
    if (window.confirm("Delete this reply?")) {
      deleteReply(flowId, commentId, replyId);
      loadComments();
    }
  };

  const getRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderTextWithMentions = (text) => {
    const parts = text.split(/(@\w+(?:\.\w+)?)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const userId = part.substring(1);
        const user = allUsers.find((u) => u.id === userId);
        return (
          <span key={index} className="mention" title={user?.name}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="comments-panel">
      <div className="comments-header">
        <h4>
          <MessageCircle size={18} />
          Comments on {nodeName || "Node"}
        </h4>
        <span className="comment-count">{comments.length}</span>
      </div>

      {/* New Comment Input */}
      <div className="comment-input-container">
        <div className="comment-avatar">
          {getUserInitials(currentUser.name)}
        </div>
        <div className="comment-input-wrapper">
          <textarea
            ref={inputRef}
            value={newCommentText}
            onChange={handleInputChange}
            placeholder="Add a comment... (use @ to mention someone)"
            className="comment-input"
            rows="3"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAddComment();
              }
            }}
          />
          {showMentionSuggestions && filteredUsers.length > 0 && (
            <div className="mention-suggestions">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="mention-suggestion"
                  onClick={() => handleMentionSelect(user)}
                >
                  <div className="mention-avatar">
                    {getUserInitials(user.name)}
                  </div>
                  <div className="mention-info">
                    <div className="mention-name">{user.name}</div>
                    <div className="mention-id">@{user.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="comment-input-actions">
            <button
              onClick={handleAddComment}
              className="btn-send-comment"
              disabled={!newCommentText.trim()}
            >
              <Send size={16} />
              Comment
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <MessageCircle size={48} />
            <p>No comments yet</p>
            <span>Be the first to comment!</span>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-avatar">
                {getUserInitials(comment.userName)}
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.userName}</span>
                  <span className="comment-time">
                    <Clock size={12} />
                    {getRelativeTime(comment.createdAt)}
                  </span>
                  {comment.userId === currentUser.id && (
                    <button
                      className="btn-delete-comment"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Delete comment"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="comment-text">
                  {renderTextWithMentions(comment.text)}
                </div>
                <div className="comment-actions">
                  <button
                    className="btn-reply"
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                  >
                    <Reply size={14} />
                    Reply
                  </button>
                  {comment.replies && comment.replies.length > 0 && (
                    <span className="reply-count">
                      {comment.replies.length}{" "}
                      {comment.replies.length === 1 ? "reply" : "replies"}
                    </span>
                  )}
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="replies">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="reply">
                        <div className="comment-avatar small">
                          {getUserInitials(reply.userName)}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">
                              {reply.userName}
                            </span>
                            <span className="comment-time">
                              <Clock size={12} />
                              {getRelativeTime(reply.createdAt)}
                            </span>
                            {reply.userId === currentUser.id && (
                              <button
                                className="btn-delete-comment"
                                onClick={() =>
                                  handleDeleteReply(comment.id, reply.id)
                                }
                                title="Delete reply"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <div className="comment-text">
                            {renderTextWithMentions(reply.text)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="reply-input-container">
                    <div className="comment-avatar small">
                      {getUserInitials(currentUser.name)}
                    </div>
                    <div className="comment-input-wrapper">
                      <textarea
                        ref={replyInputRef}
                        value={replyText}
                        onChange={(e) => handleInputChange(e, true)}
                        placeholder="Write a reply..."
                        className="comment-input small"
                        rows="2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            handleAddReply(comment.id);
                          }
                        }}
                      />
                      {showMentionSuggestions && filteredUsers.length > 0 && (
                        <div className="mention-suggestions">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="mention-suggestion"
                              onClick={() => handleMentionSelect(user, true)}
                            >
                              <div className="mention-avatar">
                                {getUserInitials(user.name)}
                              </div>
                              <div className="mention-info">
                                <div className="mention-name">{user.name}</div>
                                <div className="mention-id">@{user.id}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="comment-input-actions">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="btn-cancel-reply"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          className="btn-send-comment"
                          disabled={!replyText.trim()}
                        >
                          <Send size={14} />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
