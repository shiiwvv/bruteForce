import { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2, Circle, Trash2, ExternalLink, Clock,
  FileText, CalendarClock, ListPlus, Loader2, X, Check,
} from 'lucide-react';
import { getAllLists, addProblemToList } from '../api/lists';
import toast from 'react-hot-toast';

/**
 * Returns { label, cls } for the reminder date row.
 * - overdue / today  → amber (needs immediate attention)
 * - future           → emerald (scheduled, on track)
 * - no date          → null (hide row)
 */
function getReminderMeta(reminderTime) {
  if (!reminderTime) return null;

  const reminder = new Date(reminderTime);
  const now = new Date();

  // Normalise both to midnight for day-level comparison
  const reminderDay = new Date(reminder.getFullYear(), reminder.getMonth(), reminder.getDate());
  const today      = new Date(now.getFullYear(),      now.getMonth(),      now.getDate());

  const label = reminder.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }); // e.g. "24 Sep 2026"

  if (reminderDay.getTime() <= today.getTime()) {
    // Overdue or due today
    return {
      label,
      cls: 'text-amber-400',
      pill: 'bg-amber-400/10 border-amber-400/20',
      tag: reminderDay.getTime() === today.getTime() ? 'Due today' : 'Overdue',
    };
  }

  return {
    label,
    cls: 'text-emerald-400',
    pill: 'bg-emerald-400/10 border-emerald-400/20',
    tag: null,
  };
}

const difficultyConfig = {
  easy:   { label: 'Easy',   cls: 'text-easy   bg-emerald-400/10 border-emerald-400/20' },
  medium: { label: 'Medium', cls: 'text-medium  bg-amber-400/10  border-amber-400/20'  },
  hard:   { label: 'Hard',   cls: 'text-hard    bg-rose-400/10   border-rose-400/20'   },
};

// Outer card border — makes difficulty scannable at a glance
const difficultyBorderMap = {
  easy:   'border-emerald-500/40',
  medium: 'border-amber-500/40',
  hard:   'border-red-500/40',
};

function getDifficultyConfig(diff) {
  const key = diff?.toLowerCase();
  return difficultyConfig[key] || { label: diff, cls: 'text-text-muted bg-surface-2 border-border' };
}

function getDifficultyBorder(diff) {
  const key = diff?.toLowerCase();
  return difficultyBorderMap[key] || 'border-border';
}

// ─── Add to List Dropdown ───────────────────────────────────────────────────

function AddToListDropdown({ problemId }) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [adding, setAdding] = useState(null); // listId currently being added
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (lists.length === 0) {
      setLoadingLists(true);
      try {
        const res = await getAllLists();
        setLists(res.data?.data || []);
      } catch {
        toast.error('Could not load your lists');
      } finally {
        setLoadingLists(false);
      }
    }
  };

  const handleAdd = async (listId) => {
    setAdding(listId);
    try {
      await addProblemToList(listId, problemId);
      toast.success('Problem added to list');
      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add to list');
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id={`add-to-list-${problemId}`}
        onClick={handleOpen}
        title="Add to list"
        className="p-1.5 rounded-lg border border-border text-text-muted hover:text-primary hover:border-primary/30 hover:bg-primary-muted transition-colors cursor-pointer"
      >
        <ListPlus size={13} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Add to List
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-text-subtle hover:text-text transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>

          {/* List items */}
          <div className="max-h-48 overflow-y-auto">
            {loadingLists ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin text-text-muted" />
              </div>
            ) : lists.length === 0 ? (
              <p className="text-xs text-text-subtle text-center py-5 px-3">
                No lists yet. Create one from the My Lists panel.
              </p>
            ) : (
              lists.map((list) => (
                <button
                  key={list._id}
                  id={`add-to-list-item-${list._id}-${problemId}`}
                  onClick={() => handleAdd(list._id)}
                  disabled={adding === list._id}
                  className="w-full text-left flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-text hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="truncate">{list.title}</span>
                  {adding === list._id ? (
                    <Loader2 size={12} className="animate-spin flex-shrink-0 text-primary" />
                  ) : (
                    <Check size={12} className="flex-shrink-0 text-transparent group-hover:text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ProblemCard ──────────────────────────────────────────────────────

export default function ProblemCard({ problem, onToggleSolved, onDelete, onRemoveFromList, style }) {
  const diff = getDifficultyConfig(problem.difficulty);
  const borderCls = getDifficultyBorder(problem.difficulty);
  const reminder = getReminderMeta(problem.reminderTime);

  return (
    <div
      className={`bg-surface border ${borderCls} rounded-xl p-5 flex flex-col h-full hover:brightness-110 transition-all group animate-fade-in-up`}
      style={style}
    >
      {/* Top content — stacks naturally; mt-auto on the footer handles spacing */}
      <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {problem.title}
          </h3>
          <p className="text-xs text-text-subtle mt-1">{problem.platform}</p>
        </div>

        {/* Difficulty badge */}
        <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${diff.cls}`}>
          {diff.label}
        </span>
      </div>

      {/* Topic */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-surface-2 border border-border text-text-muted px-2.5 py-1 rounded-full">
          {problem.topic}
        </span>
        {problem.time && (
          <span className="text-xs bg-surface-2 border border-border text-text-muted px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock size={10} />
            {problem.time}
          </span>
        )}
      </div>

      {/* Notes preview */}
      {problem.notes && (
        <p className="text-xs text-text-subtle leading-relaxed line-clamp-2 flex items-start gap-1.5">
          <FileText size={11} className="flex-shrink-0 mt-0.5" />
          {problem.notes}
        </p>
      )}

      {/* Reminder date — hidden once the problem is solved */}
      {reminder && !problem.solved && (
        <div className={`flex items-center gap-1.5 text-xs border rounded-lg px-2.5 py-1.5 w-fit ${reminder.pill}`}>
          <CalendarClock size={11} className={`flex-shrink-0 ${reminder.cls}`} />
          <span className={`font-medium ${reminder.cls}`}>
            {reminder.tag ? `${reminder.tag} — ` : 'Next review: '}
            {reminder.label}
          </span>
        </div>
      )}
      </div>{/* end top content */}

      {/* Footer actions — mt-auto pins it to the bottom of every card */}
      <div className="flex items-center gap-2 pt-1 border-t border-border mt-auto">
        {/* Toggle solved */}
        <button
          id={`toggle-solved-${problem._id}`}
          onClick={() => onToggleSolved(problem._id)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer flex-1 justify-center border ${
            problem.solved
              ? 'bg-success/10 border-success/20 text-success hover:bg-success/20'
              : 'border-border text-text-muted hover:border-primary/30 hover:text-primary hover:bg-primary-muted'
          }`}
        >
          {problem.solved ? (
            <>
              <CheckCircle2 size={13} />
              Solved
            </>
          ) : (
            <>
              <Circle size={13} />
              Mark Solved
            </>
          )}
        </button>

        {/* Link */}
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noopener noreferrer"
            id={`problem-link-${problem._id}`}
            title="Open problem"
            className="p-1.5 rounded-lg border border-border text-text-muted hover:text-primary hover:border-primary/30 transition-colors"
          >
            <ExternalLink size={13} />
          </a>
        )}

        {/* Add to List — only shown in dashboard context (when onDelete is provided) */}
        {onDelete && <AddToListDropdown problemId={problem._id} />}

        {/* Remove from List — only shown in list-detail context */}
        {onRemoveFromList && (
          <button
            id={`remove-from-list-${problem._id}`}
            onClick={() => onRemoveFromList(problem._id)}
            title="Remove from list"
            className="p-1.5 rounded-lg border border-border text-text-muted hover:text-danger hover:border-danger/30 hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        )}

        {/* Delete — only shown in dashboard context */}
        {onDelete && (
          <button
            id={`delete-problem-${problem._id}`}
            onClick={() => onDelete(problem._id)}
            title="Delete problem"
            className="p-1.5 rounded-lg border border-border text-text-muted hover:text-danger hover:border-danger/30 hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
