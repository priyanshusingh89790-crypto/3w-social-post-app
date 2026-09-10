import { useState, useEffect } from 'react';
import { deletePostApi } from '../services/api';

/**
 * Confirmation dialog before deleting a post.
 * Does NOT delete on mount — requires explicit confirmation.
 */
const DeletePostDialog = ({ post, onClose, onPostDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !deleting) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, deleting]);

  const handleDelete = async () => {
    if (deleting) return;
    setError('');
    setDeleting(true);
    try {
      await deletePostApi(post._id);
      onPostDeleted(post._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete post. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div className="modal delete-dialog">
        <div className="delete-dialog-body">
          <h2 className="delete-dialog-title" id="delete-dialog-title">
            Delete this post?
          </h2>
          <p className="delete-dialog-desc">
            This action can&apos;t be undone. The post and all its likes and comments will be permanently removed.
          </p>

          {error && (
            <p className="delete-dialog-error" role="alert">{error}</p>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Confirm delete post"
          >
            {deleting ? (
              <div className="spinner spinner--sm" aria-hidden="true" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePostDialog;
