import { useState } from 'react';
import { X, Loader2, Calendar, Link as LinkIcon } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PLATFORMS = ['LeetCode', 'Codeforces', 'GeeksForGeeks', 'HackerRank', 'AtCoder', 'CodeChef', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOPICS = [
  'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Trees', 'Binary Search',
  'Graphs', 'Dynamic Programming', 'Greedy', 'Backtracking', 'Sorting', 'Hashing',
  'Two Pointers', 'Sliding Window', 'Heap', 'Tries', 'Bit Manipulation', 'Math', 'Other',
];

const today = () => {
  const d = new Date();
  return d.toISOString().split('T')[0]; // YYYY-MM-DD for min date
};

export default function AddProblemModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    title: '',
    platform: '',
    topic: '',
    difficulty: '',
    link: '',
    time: '',
    notes: '',
    reminderDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.reminderDate) {
      toast.error('Please pick a reminder date');
      return;
    }

    // Convert user-selected date (YYYY-MM-DD) into a valid future ISO 8601 string
    // We set time to start-of-day in UTC to be safe and consistent
    const isoString = new Date(form.reminderDate + 'T00:00:00.000Z').toISOString();

    setLoading(true);
    const toastId = toast.loading('Adding problem…');

    try {
      const payload = {
        title: form.title,
        platform: form.platform,
        topic: form.topic,
        difficulty: form.difficulty,
        link: form.link,
        ISOString: isoString,
        ...(form.time && { time: form.time }),
        ...(form.notes && { notes: form.notes }),
      };

      const res = await api.post('/problem/', payload);
      const msg = res.data?.message || 'Problem added!';
      toast.success(msg, { id: toastId });
      onAdded(res.data?.data);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to add problem';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      id="add-problem-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Add New Problem</h2>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Problem Title <span className="text-danger">*</span></label>
            <input
              id="problem-title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Two Sum"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
            />
          </div>

          {/* Problem Link */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Problem Link <span className="text-danger">*</span></label>
            <div className="relative">
              <LinkIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                id="problem-link"
                name="link"
                type="url"
                required
                value={form.link}
                onChange={handleChange}
                placeholder="https://leetcode.com/problems/two-sum"
                className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Platform + Difficulty row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Platform <span className="text-danger">*</span></label>
              <select
                id="problem-platform"
                name="platform"
                required
                value={form.platform}
                onChange={handleChange}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:border-primary/60 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">Select…</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Difficulty <span className="text-danger">*</span></label>
              <select
                id="problem-difficulty"
                name="difficulty"
                required
                value={form.difficulty}
                onChange={handleChange}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:border-primary/60 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">Select…</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Topic <span className="text-danger">*</span></label>
            <select
              id="problem-topic"
              name="topic"
              required
              value={form.topic}
              onChange={handleChange}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:border-primary/60 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="">Select topic…</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Reminder Date */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                Reminder Date <span className="text-danger">*</span>
              </span>
            </label>
            <input
              id="reminder-date"
              name="reminderDate"
              type="date"
              required
              min={today()}
              value={form.reminderDate}
              onChange={handleChange}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:border-primary/60 focus:outline-none transition-colors [color-scheme:dark] cursor-pointer"
            />
            <p className="text-xs text-text-subtle mt-1">You'll receive an email reminder on this date.</p>
          </div>

          {/* Time taken (optional) */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Time Taken <span className="text-text-subtle">(optional)</span></label>
            <input
              id="problem-time"
              name="time"
              type="text"
              value={form.time}
              onChange={handleChange}
              placeholder="e.g. 25 mins"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
            />
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Notes <span className="text-text-subtle">(optional)</span></label>
            <textarea
              id="problem-notes"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              placeholder="Key insight, approach, pattern…"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              id="cancel-modal-btn"
              onClick={onClose}
              className="flex-1 border border-border text-text-muted hover:text-text hover:border-border-subtle rounded-lg py-2.5 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="add-problem-submit-btn"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading ? 'Adding…' : 'Add Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
