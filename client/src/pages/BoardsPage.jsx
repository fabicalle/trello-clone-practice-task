import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/Header.jsx';
import * as boardsApi from '../api/boards.js';

const PRESET_COLORS = ['#4f46e5', '#0891b2', '#059669', '#dc2626', '#7c3aed', '#db2777'];

export default function BoardsPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    try {
      const boards = await boardsApi.getBoards();
      setBoards(boards);
    } catch {
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const board = await boardsApi.createBoard({ title: newTitle.trim(), color: newColor });
      setBoards((prev) => [...prev, board]);
      setNewTitle('');
      setNewColor(PRESET_COLORS[0]);
      setShowForm(false);
      toast.success('Board created');
    } catch {
      toast.error('Failed to create board');
    }
  }

  async function handleDeleteBoard(e, boardId, boardTitle) {
    e.stopPropagation();
    if (!window.confirm(`Delete board "${boardTitle}"? This cannot be undone.`)) return;
    try {
      await boardsApi.deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-0)' }}>
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%', width: '50%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 65%)',
        }} />
      </div>

      <Header />

      <main className="relative z-10 pt-12">
        <div className="max-w-5xl mx-auto px-5 py-10">

          {/* Page heading */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #818cf8, #06b6d4)' }} />
            <h1 className="font-display text-xl font-bold tracking-wide" style={{ color: 'var(--text-0)' }}>
              Your Boards
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div
                className="w-9 h-9 rounded-full animate-spin"
                style={{
                  border: '2px solid transparent',
                  borderTopColor: '#818cf8',
                  borderRightColor: '#22d3ee',
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/boards/${board.id}`)}
                  className="relative group neon-board-tile rounded-xl h-28 cursor-pointer overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${board.color || '#4f46e5'}cc 0%, ${board.color || '#4f46e5'}88 100%)`,
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: `0 4px 24px ${board.color || '#4f46e5'}33`,
                  }}
                >
                  {/* Noise texture overlay */}
                  <div className="absolute inset-0 opacity-30"
                    style={{ background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />

                  <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                    <h3 className="font-display font-semibold text-sm text-white tracking-wide truncate pr-7 drop-shadow">
                      {board.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-white/30" />
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteBoard(e, board.id, board.title)}
                    className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-all rounded-lg p-1.5"
                    style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
                    title="Delete board"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.35)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Create new board */}
              {showForm ? (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'var(--bg-3)',
                    border: '1px solid var(--border-2)',
                  }}
                >
                  <form onSubmit={handleCreateBoard}>
                    <input
                      type="text"
                      placeholder="Board title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      autoFocus
                      className="input-dark w-full rounded-lg px-3 py-2 text-sm mb-3"
                    />

                    <div className="flex gap-2 mb-3">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewColor(color)}
                          className={`w-7 h-7 rounded-lg color-swatch ${newColor === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="btn-primary px-4 py-1.5 rounded-lg text-xs flex-1"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowForm(false); setNewTitle(''); }}
                        className="btn-ghost px-3 py-1.5 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div
                  onClick={() => setShowForm(true)}
                  className="rounded-xl h-28 cursor-pointer flex items-center justify-center gap-2 transition-all group neon-card"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px dashed var(--border-2)',
                  }}
                >
                  <svg
                    className="w-4 h-4 transition-colors"
                    style={{ color: 'var(--text-2)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>
                    New board
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
