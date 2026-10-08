import { useState, useEffect, useRef } from 'react';
import { X, ListPlus, Loader2 } from 'lucide-react';
import { createList } from '../api/lists';
import toast from 'react-hot-toast';

/**
 * Modal to create a new list.
 * Props:
 *  - onClose()            – dismiss the modal
 *  - onCreated(newList)   – called after a successful creation
 */
export default function CreateListModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const titleRef = useRef(null);

  // Auto-focus title input on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setLoading(true);
    try {
      const res = await createList({ title: title.trim(), description: description.trim() });
      toast.success(`List "${res.data?.data?.title}" created`);
      onCreated(res.data?.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create list');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-muted flex items-center justify-center">
              <ListPlus size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold text-text">Create New List</h2>
          </div>
          <button
            id="create-list-close-btn"
            onClick={onClose}
            className="text-text-subtle hover:text-text transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-surface-2"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="list-title" className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id="list-title"
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Graph Algorithms, Week 1 Practice"
              maxLength={80}
              className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="list-description" className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="list-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — what is this list for?"
              rows={3}
              maxLength={300}
              className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              id="create-list-cancel-btn"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-text-muted border border-border hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="create-list-submit-btn"
              disabled={loading || !title.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-white transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ListPlus size={14} />}
              {loading ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
