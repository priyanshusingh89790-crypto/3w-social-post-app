import { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

/**
 * Three-dot menu shown only to the post owner.
 * Closes on: outside click, Escape key, or item selection.
 */
const PostActionsMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleEdit = () => {
    setOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete();
  };

  return (
    <div className="post-menu-wrap" ref={wrapRef}>
      <button
        ref={btnRef}
        className="btn-post-menu"
        onClick={() => setOpen((v) => !v)}
        aria-label="Post options"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open && (
        <div
          className="post-menu-dropdown"
          role="menu"
          aria-label="Post actions"
        >
          <button
            className="post-menu-item"
            role="menuitem"
            onClick={handleEdit}
          >
            <Pencil size={14} strokeWidth={1.75} aria-hidden="true" />
            Edit post
          </button>
          <button
            className="post-menu-item post-menu-item--danger"
            role="menuitem"
            onClick={handleDelete}
          >
            <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
            Delete post
          </button>
        </div>
      )}
    </div>
  );
};

export default PostActionsMenu;
