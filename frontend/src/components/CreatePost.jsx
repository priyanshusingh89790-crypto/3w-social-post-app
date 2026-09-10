import { useState, useRef } from 'react';
import { createPostApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ImagePlus, X } from 'lucide-react';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);      // File object
  const [preview, setPreview] = useState('');    // Data URL
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const initial = user?.username?.[0]?.toUpperCase() || '?';
  const dataInitial = user?.username?.[0]?.toLowerCase() || 'z';

  const handleImageChange = (e) => {
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
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();

    if (!trimmed && !image) {
      setError('Please add some text or an image');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (trimmed) formData.append('text', trimmed);
      if (image) formData.append('image', image);

      const { data } = await createPostApi(formData);
      onPostCreated(data.data.post);

      setText('');
      removeImage();
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = (text.trim() || image) && !submitting;

  return (
    <section className="composer" aria-label="Create a post">
      <form onSubmit={handleSubmit} noValidate>
        {/* Top row: avatar + textarea */}
        <div className="composer-top">
          <div
            className="avatar avatar--md"
            aria-hidden="true"
            data-initial={dataInitial}
          >
            {initial}
          </div>

          <div className="composer-input-wrap">
            <label htmlFor="post-text" className="sr-only">
              What&apos;s on your mind?
            </label>
            <textarea
              id="post-text"
              className="composer-textarea"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={submitting}
              maxLength={2000}
              rows={3}
            />
          </div>
        </div>

        {/* Image preview */}
        {preview && (
          <div className="composer-preview" style={{ marginLeft: 0 }}>
            <img src={preview} alt="Selected image preview" />
            <button
              type="button"
              className="composer-remove-img"
              onClick={removeImage}
              disabled={submitting}
              aria-label="Remove image"
            >
              <X size={14} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Bottom bar */}
        <div className="composer-bar">
          <div className="composer-tools">
            <label className="btn-tool" aria-label="Attach image">
              <ImagePlus size={16} strokeWidth={1.75} aria-hidden="true" />
              Photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                disabled={submitting}
                ref={fileInputRef}
                aria-label="Upload image file"
              />
            </label>
          </div>

          <button
            type="submit"
            className="btn-publish"
            disabled={!canSubmit}
            aria-label="Publish post"
          >
            {submitting ? (
              <div className="spinner spinner--sm" aria-hidden="true" />
            ) : (
              'Publish'
            )}
          </button>
        </div>

        {error && (
          <p className="composer-error" role="alert">{error}</p>
        )}
      </form>
    </section>
  );
};

export default CreatePost;
