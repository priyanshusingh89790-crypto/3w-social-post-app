import { useState } from 'react';
import { addCommentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/time';
import { Send } from 'lucide-react';

const INITIAL_VISIBLE = 3;

const CommentSection = ({ postId, comments, onPostUpdate }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const visibleComments = showAll ? comments : comments.slice(-INITIAL_VISIBLE);
  const hiddenCount = comments.length - INITIAL_VISIBLE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setError('');
    setSubmitting(true);
    try {
      const { data } = await addCommentApi(postId, trimmed);
      onPostUpdate(data.data.post);
      setText('');
      setShowAll(true);
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const initial = (username) => username?.[0]?.toUpperCase() || '?';

  return (
    <div className="comment-section">
      <div className="comment-section-divider" />

      {/* Show more toggle */}
      {!showAll && hiddenCount > 0 && (
        <button
          className="show-more-comments"
          onClick={() => setShowAll(true)}
          aria-expanded="false"
        >
          View {hiddenCount} more comment{hiddenCount > 1 ? 's' : ''}
        </button>
      )}

      {/* Comment list */}
      {visibleComments.length > 0 && (
        <ul className="comment-list" aria-label="Comments">
          {visibleComments.map((comment) => (
            <li key={comment._id} className="comment-item">
              <div
                className="avatar avatar--sm"
                aria-hidden="true"
                data-initial={comment.user?.username?.[0]?.toLowerCase()}
              >
                {initial(comment.user?.username)}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-username">
                    {comment.user?.username || 'Unknown'}
                  </span>
                  <time className="comment-time" dateTime={comment.createdAt}>
                    {formatRelativeTime(comment.createdAt)}
                  </time>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Input */}
      {user && (
        <form className="comment-form" onSubmit={handleSubmit} noValidate>
          <div
            className="avatar avatar--sm"
            aria-hidden="true"
            data-initial={user.username?.[0]?.toLowerCase()}
            style={{ flexShrink: 0 }}
          >
            {initial(user.username)}
          </div>

          <label htmlFor={`comment-input-${postId}`} className="sr-only">
            Write a comment
          </label>
          <input
            id={`comment-input-${postId}`}
            type="text"
            className="comment-input"
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitting}
            maxLength={500}
            autoComplete="off"
          />

          <button
            type="submit"
            className="btn-send-comment"
            disabled={submitting || !text.trim()}
            aria-label="Post comment"
          >
            {submitting ? (
              <div className="spinner spinner--sm" aria-hidden="true" />
            ) : (
              <Send size={14} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </form>
      )}

      {error && (
        <p className="comment-error" role="alert">{error}</p>
      )}
    </div>
  );
};

export default CommentSection;
