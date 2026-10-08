import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getAllLists, deleteList } from '../api/lists';
import Navbar from '../components/Navbar';
import ProblemCard from '../components/ProblemCard';
import AddProblemModal from '../components/AddProblemModal';
import CreateListModal from '../components/CreateListModal';
import {
  Plus, Search, LayoutGrid,
  Loader2, AlertCircle, TrendingUp, CheckSquare, Square,
  RefreshCw, ListPlus, Trash2, ChevronRight, FolderOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FILTER_OPTIONS = ['All', 'Solved', 'Unsolved'];
const DIFFICULTY_FILTERS = ['All', 'Easy', 'Medium', 'Hard'];

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className={`bg-surface border rounded-xl p-5 flex items-center gap-4 ${accent || 'border-border'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? 'bg-primary-muted' : 'bg-surface-2'}`}>
        <Icon size={18} className={accent ? 'text-primary' : 'text-text-muted'} />
      </div>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

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

// ─── My Lists Sidebar ─────────────────────────────────────────────────────

function MyListsSidebar({ lists, loadingLists, onCreateClick, onListDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (e, listId) => {
    e.preventDefault(); // don't navigate via the Link
    e.stopPropagation();
    const confirmed = window.confirm('Delete this list? This cannot be undone.');
    if (!confirmed) return;
    setDeletingId(listId);
    try {
      await deleteList(listId);
      toast.success('List deleted');
      onListDeleted(listId);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete list');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-surface border border-border rounded-2xl overflow-hidden sticky top-6">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderOpen size={15} className="text-primary" />
            <span className="text-sm font-semibold text-text">My Lists</span>
            <span className="text-xs text-text-muted bg-surface-2 border border-border px-1.5 py-0.5 rounded-full">
              {lists.length}
            </span>
          </div>
          <button
            id="open-create-list-modal-btn"
            onClick={onCreateClick}
            title="Create new list"
            className="p-1.5 rounded-lg border border-border text-text-muted hover:text-primary hover:border-primary/30 hover:bg-primary-muted transition-colors cursor-pointer"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* List items */}
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {loadingLists ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="animate-spin text-text-muted" />
            </div>
          ) : lists.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center">
                <ListPlus size={18} className="text-primary" />
              </div>
              <p className="text-xs text-text-muted">
                No lists yet. Create one to group your problems.
              </p>
              <button
                id="empty-create-list-btn"
                onClick={onCreateClick}
                className="text-xs text-primary hover:text-primary-hover font-medium transition-colors cursor-pointer"
              >
                Create your first list
              </button>
            </div>
          ) : (
            lists.map((list) => (
              <Link
                key={list._id}
                to={`/lists/${list._id}`}
                id={`list-item-${list._id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">
                    {list.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {list.problems?.length ?? 0} problem{list.problems?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {deletingId === list._id ? (
                    <Loader2 size={12} className="animate-spin text-text-muted" />
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleDelete(e, list._id)}
                        title="Delete list"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-subtle hover:text-danger transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                      <ChevronRight size={13} className="text-text-subtle" />
                    </>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer CTA */}
        {lists.length > 0 && (
          <div className="px-4 py-3 border-t border-border">
            <button
              id="create-list-footer-btn"
              onClick={onCreateClick}
              className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-primary border border-primary/20 hover:bg-primary-muted transition-colors cursor-pointer"
            >
              <Plus size={12} />
              New List
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');

  // Lists state
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/problem/');
      setProblems(res.data?.data || []);
    } catch (err) {
      // 404 means no problems yet — not an error state
      if (err?.response?.status === 404) {
        setProblems([]);
      } else {
        setError(err?.response?.data?.message || 'Failed to load problems');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLists = useCallback(async () => {
    setLoadingLists(true);
    try {
      const res = await getAllLists();
      setLists(res.data?.data || []);
    } catch {
      // Silently fail — lists are supplementary
      setLists([]);
    } finally {
      setLoadingLists(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
    fetchLists();
  }, [fetchProblems, fetchLists]);

  const handleToggleSolved = async (problemId) => {
    // Optimistic update
    setProblems((prev) =>
      prev.map((p) => p._id === problemId ? { ...p, solved: !p.solved } : p)
    );
    try {
      await api.patch(`/problem/update/mark/${problemId}`);
    } catch {
      // Revert on failure
      setProblems((prev) =>
        prev.map((p) => p._id === problemId ? { ...p, solved: !p.solved } : p)
      );
      toast.error('Failed to update problem status');
    }
  };

  const handleDelete = async (problemId) => {
    const confirmed = window.confirm('Delete this problem? This cannot be undone.');
    if (!confirmed) return;

    // Optimistic removal
    setProblems((prev) => prev.filter((p) => p._id !== problemId));
    try {
      await api.delete(`/problem/delete/${problemId}`);
      toast.success('Problem deleted');
    } catch {
      toast.error('Failed to delete problem');
      fetchProblems(); // Reload on failure
    }
  };

  const handleAdded = (newProblem) => {
    if (Array.isArray(newProblem)) {
      // Already existed — backend returns array
      toast('Problem already in your list!');
    } else if (newProblem) {
      setProblems((prev) => [newProblem, ...prev]);
    }
  };

  const handleListCreated = (newList) => {
    setLists((prev) => [newList, ...prev]);
  };

  const handleListDeleted = (listId) => {
    setLists((prev) => prev.filter((l) => l._id !== listId));
  };

  // Derived stats
  const totalCount = problems.length;
  const solvedCount = problems.filter((p) => p.solved).length;
  const unsolvedCount = totalCount - solvedCount;

  // Filtering
  const filtered = problems.filter((p) => {
    const matchSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.platform?.toLowerCase().includes(search.toLowerCase()) ||
      p.topic?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Solved' && p.solved) ||
      (statusFilter === 'Unsolved' && !p.solved);

    const matchDiff =
      diffFilter === 'All' ||
      p.difficulty?.toLowerCase() === diffFilter.toLowerCase();

    return matchSearch && matchStatus && matchDiff;
  });

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">
              Good {getGreeting()}, {user?.firstName || user?.username}
            </h1>
            <p className="text-text-muted text-sm mt-1">Track, solve, and never forget a DSA pattern.</p>
          </div>
          <button
            id="open-add-problem-btn"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
          >
            <Plus size={16} />
            Add Problem
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Problems" value={totalCount} icon={LayoutGrid} accent="border-border" />
          <StatCard label="Solved" value={solvedCount} icon={CheckSquare} accent="border-success/20" />
          <StatCard label="Unsolved" value={unsolvedCount} icon={Square} accent="border-border" />
        </div>

        {/* Main layout: problem grid + lists sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Problems panel */}
          <div className="flex-1 min-w-0">
            {/* Filters + search */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  id="problem-search"
                  type="text"
                  placeholder="Search by title, topic, platform…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
                />
              </div>

              {/* Status filter */}
              <div className="flex gap-1.5 bg-surface border border-border rounded-xl p-1">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    id={`filter-status-${opt.toLowerCase()}`}
                    onClick={() => setStatusFilter(opt)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === opt
                        ? 'bg-primary text-white'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Difficulty filter */}
              <div className="flex gap-1.5 bg-surface border border-border rounded-xl p-1">
                {DIFFICULTY_FILTERS.map((opt) => (
                  <button
                    key={opt}
                    id={`filter-diff-${opt.toLowerCase()}`}
                    onClick={() => setDiffFilter(opt)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      diffFilter === opt
                        ? 'bg-primary text-white'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Refresh */}
              <button
                id="refresh-problems-btn"
                onClick={fetchProblems}
                title="Refresh"
                className="p-2.5 rounded-xl border border-border text-text-muted hover:text-text hover:border-border-subtle transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <AlertCircle size={36} className="text-danger" />
                <p className="text-text-muted">{error}</p>
                <button
                  onClick={fetchProblems}
                  className="text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
                >
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-muted flex items-center justify-center">
                  <TrendingUp size={28} className="text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-text">
                    {problems.length === 0 ? 'No problems yet!' : 'No results found'}
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    {problems.length === 0
                      ? 'Add your first DSA problem to start tracking.'
                      : 'Try adjusting your search or filters.'}
                  </p>
                </div>
                {problems.length === 0 && (
                  <button
                    id="empty-state-add-btn"
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                    Add First Problem
                  </button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((problem, i) => (
                  <ProblemCard
                    key={problem._id}
                    problem={problem}
                    onToggleSolved={handleToggleSolved}
                    onDelete={handleDelete}
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: My Lists sidebar */}
          <MyListsSidebar
            lists={lists}
            loadingLists={loadingLists}
            onCreateClick={() => setShowCreateList(true)}
            onListDeleted={handleListDeleted}
          />
        </div>
      </main>

      {/* Add Problem Modal */}
      {showModal && (
        <AddProblemModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}

      {/* Create List Modal */}
      {showCreateList && (
        <CreateListModal
          onClose={() => setShowCreateList(false)}
          onCreated={handleListCreated}
        />
      )}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
