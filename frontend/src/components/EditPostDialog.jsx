import { useState, useRef, useEffect } from 'react';
import { updatePostApi } from '../services/api';
import { X, ImagePlus, AlertCircle } from 'lucide-react';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Modal dialog for editing an owned post.
 * Supports: change text, replace image, remove image.
 * Sends FormData when a new image file is involved; plain FormData always.
 */
const EditPostDialog = ({ post, onClose, onPostUpdate }) => {
  const [text, setText] = useState(post.text || '');
  // newFile: a new File chosen to replace the image
  const [newFile, setNewFile] = useState(null);
  // newPreview: data URL for the new file preview
  const [newPreview, setNewPreview] = useState('');
  // removeExisting: user wants to remove the current image (no replacement)
  const [removeExisting, setRemoveExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const firstFocusRef = useRef(null);

  // Trap focus on mount
  useEffect(() => {
    firstFocusRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, submitting]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are allowed');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_SIZE_MB} MB`);
      return;
    }

    setError('');
    setNewFile(file);
    setRemoveExisting(false); // replacing, not just removing
    const reader = new FileReader();
    reader.onloadend = () => setNewPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveNewFile = () => {
    setNewFile(null);
    setNewPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveExisting = () => {
    setRemoveExisting(true);
    setNewFile(null);
    setNewPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError('');
  };

  const handleRestoreExisting = () => {
    setRemoveExisting(false);
    setError('');
  };

  // Decide what the effective image state will be after save
  const effectiveImageExists = newFile
    ? true                          // uploading a replacement
    : removeExisting
      ? false                       // explicitly removed
      : Boolean(post.image);        // unchanged existing

  const trimmedText = text.trim();
  const canSave = (trimmedText || effectiveImageExists) && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!trimmedText && !effectiveImageExists) {
      setError('A post must have either text or an image');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      // Always send text field (empty string means clear it)
      formData.append('text', trimmedText);

      if (newFile) {
        formData.append('image', newFile);
      } else if (removeExisting) {
        formData.append('removeImage', 'true');
      }
      // if neither: no image-related field → backend preserves existing image

      const { data } = await updatePostApi(post._id, formData);
      onPostUpdate(data.data.post);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSubmitting(false);
    }
  };

  // What image preview to show
  const showNewPreview = Boolean(newPreview);
  const showExistingImage = !showNewPreview && !removeExisting && Boolean(post.image);
  const showRemovedNotice = !showNewPreview && removeExisting && Boolean(post.image);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" id="edit-dialog-title">Edit post</h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close edit dialog"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Text */}
            <div>
              <label
                htmlFor="edit-post-text"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--sp-2)',
                  letterSpacing: '0.01em',
                }}
              >
                Text
              </label>
              <textarea
                id="edit-post-text"
                ref={firstFocusRef}
                className="edit-textarea"
                value={text}
                onChange={(e) => { setText(e.target.value); setError(''); }}
                placeholder="Write something worth sharing…"
                disabled={submitting}
                maxLength={2000}
                rows={4}
              />
            </div>

            {/* Image section */}
            <div className="edit-image-section">
              <span className="edit-image-label">Image</span>

              {/* Show new file preview */}
              {showNewPreview && (
                <div className="edit-current-image">
                  <img src={newPreview} alt="New image preview" />
                  <button
                    type="button"
                    className="edit-remove-img"
                    onClick={handleRemoveNewFile}
                    disabled={submitting}
                    aria-label="Remove selected image"
                  >
                    <X size={12} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* Show existing image (unchanged) */}
              {showExistingImage && (
                <div className="edit-current-image">
                  <img src={post.image} alt="Current post image" />
                  <button
                    type="button"
                    className="edit-remove-img"
                    onClick={handleRemoveExisting}
                    disabled={submitting}
                    aria-label="Remove current image"
                  >
                    <X size={12} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* Show removed notice */}
              {showRemovedNotice && (
                <div className="edit-removed-notice">
                  <AlertCircle size={14} strokeWidth={1.75} aria-hidden="true" />
                  Image will be removed on save.{' '}
                  <button
                    type="button"
                    onClick={handleRestoreExisting}
                    disabled={submitting}
                    style={{
                      color: 'var(--primary)',
                      fontWeight: 600,
                      fontSize: '13px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '4px',
                    }}
                  >
                    Undo
                  </button>
                </div>
              )}

              {/* File picker */}
              <label
                className="btn-tool"
                style={{ alignSelf: 'flex-start' }}
                aria-label="Choose replacement image"
              >
                <ImagePlus size={15} strokeWidth={1.75} aria-hidden="true" />
                {post.image && !removeExisting ? 'Replace image' : 'Add image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  disabled={submitting}
                  ref={fileInputRef}
                  aria-label="Upload replacement image"
                />
              </label>
            </div>

            {/* Error */}
            {error && (
              <p className="edit-error" role="alert">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={!canSave}
            >
              {submitting ? (
                <div className="spinner spinner--sm" aria-hidden="true" />
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostDialog;
