import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toggleLikeApi } from '../services/api';
import CommentSection from './CommentSection';
import PostActionsMenu from './PostActionsMenu';
import EditPostDialog from './EditPostDialog';
import DeletePostDialog from './DeletePostDialog';
import { formatRelativeTime } from '../utils/time';
import { Heart, MessageCircle } from 'lucide-react';

const PostCard = ({ post, onPostUpdate, onPostDelete }) => {
  const { user } = useAuth();
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Reliable like check: compare both as strings to handle ObjectId vs string
  const isLiked = user
    ? post.likes.some((l) => {
        const likeId = l._id ? String(l._id) : String(l);
        return likeId === String(user._id);
      })
    : false;

  // Ownership check — frontend only for UX visibility
  const isOwner = user
    ? String(post.user?._id || post.user) === String(user._id)
    : false;

  const initial = (username) => username?.[0]?.toUpperCase() || '?';
  const dataInitial = post.user?.username?.[0]?.toLowerCase() || 'z';

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      const { data } = await toggleLikeApi(post._id);
      onPostUpdate(data.data.post);
    } catch {
      // silent — could add toast here
    } finally {
      setLiking(false);
    }
  };

  const likeLabel = post.likeCount === 1 ? '1 like' : `${post.likeCount} likes`;
  const commentLabel =
    post.commentCount === 1 ? '1 comment' : `${post.commentCount} comments`;

  return (
    <>
      <article className="post-card">
        {/* ── Header ── */}
        <div className="post-card-header">
          {/* Avatar — left */}
          <div
            className="avatar avatar--md"
            aria-hidden="true"
            data-initial={dataInitial}
          >
            {initial(post.user?.username)}
          </div>

          {/* Username + timestamp — left, flex-1 */}
          <div className="post-meta">
            <div className="post-username">{post.user?.username || 'Unknown'}</div>
            <time className="post-time" dateTime={post.createdAt}>
              {formatRelativeTime(post.createdAt)}
            </time>
          </div>

          {/* Three-dot menu — far right, owner only */}
          {isOwner && (
            <PostActionsMenu
              onEdit={() => setShowEditDialog(true)}
              onDelete={() => setShowDeleteDialog(true)}
            />
          )}
        </div>

        {/* ── Body ── */}
        <div className="post-body">
          {post.text && <p className="post-text">{post.text}</p>}
          {post.image && (
            <div className="post-image">
              <img
                src={post.image}
                alt={
                  post.text
                    ? `Image for: ${post.text.slice(0, 60)}`
                    : 'Post image'
                }
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* ── Footer: counts + like/comment actions ── */}
        <div className="post-footer">
          <div className="post-counts">
            {post.likeCount > 0 && <span>{likeLabel}</span>}
            {post.commentCount > 0 && (
              <button
                className="post-count-btn"
                onClick={() => setShowComments((v) => !v)}
                aria-expanded={showComments}
              >
                {commentLabel}
              </button>
            )}
          </div>

          <div className="post-actions" role="group" aria-label="Post actions">
            <button
              className={`post-action-btn${isLiked ? ' liked' : ''}`}
              onClick={handleLike}
              disabled={!user || liking}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
              aria-pressed={isLiked}
            >
              {liking ? (
                <div className="spinner spinner--sm" aria-hidden="true" />
              ) : (
                <Heart
                  size={16}
                  strokeWidth={isLiked ? 0 : 1.75}
                  className="like-icon"
                  aria-hidden="true"
                />
              )}
              Like
            </button>

            <button
              className="post-action-btn"
              onClick={() => setShowComments((v) => !v)}
              aria-expanded={showComments}
              aria-label="Toggle comments"
            >
              <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" />
              Comment
            </button>
          </div>
        </div>

        {/* ── Inline comments ── */}
        {showComments && (
          <CommentSection
            postId={post._id}
            comments={post.comments}
            onPostUpdate={onPostUpdate}
          />
        )}
      </article>

      {/* ── Dialogs rendered outside the article to avoid stacking context issues ── */}
      {showEditDialog && (
        <EditPostDialog
          post={post}
          onClose={() => setShowEditDialog(false)}
          onPostUpdate={(updatedPost) => {
            onPostUpdate(updatedPost);
            setShowEditDialog(false);
          }}
        />
      )}

      {showDeleteDialog && (
        <DeletePostDialog
          post={post}
          onClose={() => setShowDeleteDialog(false)}
          onPostDeleted={(deletedId) => {
            if (onPostDelete) onPostDelete(deletedId);
            setShowDeleteDialog(false);
          }}
        />
      )}
    </>
  );
};

export default PostCard;
