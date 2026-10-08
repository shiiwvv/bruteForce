import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getList, removeProblemFromList } from '../api/lists';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ProblemCard from '../components/ProblemCard';
import {
  ArrowLeft, Loader2, AlertCircle, FolderOpen, TrendingUp,
  CheckSquare, Square, LayoutGrid,
} from 'lucide-react';
import toast from 'react-hot-toast';

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/3" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="skeleton h-8 w-full rounded-lg" />
    </div>
  );
}

function StatPill({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-muted bg-surface border border-border rounded-lg px-3 py-1.5">
      <Icon size={12} className="text-primary" />
      <span className="font-semibold text-text">{value}</span>
      <span>{label}</span>
    </div>
  );
}

export default function ListDetailsPage() {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getList(listId);
      setList(res.data?.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load list');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleToggleSolved = async (problemId) => {
    // Optimistic update on the nested problem objects
    setList((prev) => ({
      ...prev,
      problems: prev.problems.map((p) =>
        p._id === problemId ? { ...p, solved: !p.solved } : p
      ),
    }));
    try {
      await api.patch(`/problem/update/mark/${problemId}`);
    } catch {
      // Revert
      setList((prev) => ({
        ...prev,
        problems: prev.problems.map((p) =>
          p._id === problemId ? { ...p, solved: !p.solved } : p
        ),
      }));
      toast.error('Failed to update problem status');
    }
  };

  const handleRemoveFromList = async (problemId) => {
    const confirmed = window.confirm('Remove this problem from the list?');
    if (!confirmed) return;

    // Optimistic removal
    setList((prev) => ({
      ...prev,
      problems: prev.problems.filter((p) => p._id !== problemId),
    }));
    try {
      await removeProblemFromList(listId, problemId);
      toast.success('Problem removed from list');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove problem');
      fetchList(); // Reload on failure
    }
  };

  // Derived stats
  const problems = list?.problems ?? [];
  const total = problems.length;
  const solved = problems.filter((p) => p.solved).length;
  const unsolved = total - solved;

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Back link */}
        <Link
          to="/dashboard"
          id="list-details-back-btn"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>

        {loading ? (
          /* Loading state */
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="skeleton h-8 w-48 rounded-lg" />
              <div className="skeleton h-5 w-24 rounded-lg" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : error ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <AlertCircle size={40} className="text-danger" />
            <p className="text-text-muted">{error}</p>
            <button
              onClick={fetchList}
              className="text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center flex-shrink-0">
                  <FolderOpen size={18} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text">{list?.title}</h1>
                  {list?.description && (
                    <p className="text-text-muted text-sm mt-1 max-w-xl">{list.description}</p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-2 mt-4">
                <StatPill icon={LayoutGrid} value={total}   label="total" />
                <StatPill icon={CheckSquare} value={solved}   label="solved" />
                <StatPill icon={Square}      value={unsolved} label="unsolved" />
              </div>
            </div>

            {/* Problem grid */}
            {problems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-muted flex items-center justify-center">
                  <TrendingUp size={28} className="text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-text">This list is empty</p>
                  <p className="text-text-muted text-sm mt-1">
                    Head back to the dashboard and use the{' '}
                    <span className="text-primary font-medium">Add to List</span> button on any problem card.
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  <ArrowLeft size={14} />
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {problems.map((problem, i) => (
                  <ProblemCard
                    key={problem._id}
                    problem={problem}
                    onToggleSolved={handleToggleSolved}
                    onRemoveFromList={handleRemoveFromList}
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
