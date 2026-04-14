import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import * as cardDetailsApi from '../api/cardDetails.js';
import * as cardsApi from '../api/cards.js';
import DueDateBadge from './DueDateBadge.jsx';

const LABEL_COLORS = ['#22c55e', '#eab308', '#f97316', '#f87171', '#c084fc', '#22d3ee'];

function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CardModal({ card: initialCard, listId, onClose, onUpdate }) {
  const [card, setCard] = useState(initialCard);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(initialCard.title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [description, setDescription] = useState(initialCard.description || '');
  const [dueDate, setDueDate] = useState(initialCard.dueDate ? initialCard.dueDate.slice(0, 10) : '');
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [labelText, setLabelText] = useState('');
  const [labelColor, setLabelColor] = useState(LABEL_COLORS[0]);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState({});
  const [newComment, setNewComment] = useState('');
  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  async function refreshCard() {
    try {
      const fullCard = await cardDetailsApi.getCard(card.id);
      setCard(fullCard);
      onUpdate(fullCard);
    } catch {
      // keep existing data
    }
  }

  useEffect(() => {
    refreshCard();
  }, []);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  async function saveTitle() {
    if (!title.trim()) {
      setTitle(card.title);
      setEditingTitle(false);
      return;
    }
    try {
      const updated = await cardsApi.updateCard(listId, card.id, { title: title.trim() });
      setCard((prev) => ({ ...prev, title: updated.title }));
      onUpdate({ ...card, title: updated.title });
    } catch {
      toast.error('Failed to update title');
      setTitle(card.title);
    }
    setEditingTitle(false);
  }

  async function saveDescription() {
    try {
      const updated = await cardsApi.updateCard(listId, card.id, { description });
      setCard((prev) => ({ ...prev, description: updated.description }));
      onUpdate({ ...card, description: updated.description });
    } catch {
      toast.error('Failed to update description');
    }
    setEditingDesc(false);
  }

  async function saveDueDate(value) {
    setDueDate(value);
    try {
      const payload = value ? { dueDate: value } : { dueDate: null };
      const updated = await cardsApi.updateCard(listId, card.id, payload);
      setCard((prev) => ({ ...prev, dueDate: updated.dueDate }));
      onUpdate({ ...card, dueDate: updated.dueDate });
    } catch {
      toast.error('Failed to update due date');
    }
  }

  async function handleAddLabel() {
    if (!labelText.trim()) return;
    try {
      await cardDetailsApi.addLabel(card.id, {
        text: labelText.trim(),
        color: labelColor,
      });
      await refreshCard();
      setLabelText('');
      setShowLabelForm(false);
    } catch {
      toast.error('Failed to add label');
    }
  }

  async function handleDeleteLabel(labelId) {
    try {
      await cardDetailsApi.deleteLabel(card.id, labelId);
      await refreshCard();
    } catch {
      toast.error('Failed to delete label');
    }
  }

  async function handleAddChecklist() {
    if (!newChecklistTitle.trim()) return;
    try {
      await cardDetailsApi.addChecklist(card.id, {
        title: newChecklistTitle.trim(),
      });
      await refreshCard();
      setNewChecklistTitle('');
      setShowChecklistForm(false);
    } catch {
      toast.error('Failed to add checklist');
    }
  }

  async function handleDeleteChecklist(checklistId) {
    try {
      await cardDetailsApi.deleteChecklist(card.id, checklistId);
      await refreshCard();
    } catch {
      toast.error('Failed to delete checklist');
    }
  }

  async function handleAddChecklistItem(checklistId) {
    const text = newItemTexts[checklistId]?.trim();
    if (!text) return;
    try {
      await cardDetailsApi.addChecklistItem(card.id, checklistId, { text });
      await refreshCard();
      setNewItemTexts((prev) => ({ ...prev, [checklistId]: '' }));
    } catch {
      toast.error('Failed to add item');
    }
  }

  async function handleToggleItem(checklistId, itemId) {
    try {
      await cardDetailsApi.toggleChecklistItem(card.id, checklistId, itemId);
      await refreshCard();
    } catch {
      toast.error('Failed to toggle item');
    }
  }

  async function handleDeleteItem(checklistId, itemId) {
    try {
      await cardDetailsApi.deleteChecklistItem(card.id, checklistId, itemId);
      await refreshCard();
    } catch {
      toast.error('Failed to delete item');
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    try {
      await cardDetailsApi.addComment(card.id, { text: newComment.trim() });
      await refreshCard();
      setNewComment('');
    } catch {
      toast.error('Failed to post comment');
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await cardDetailsApi.deleteComment(card.id, commentId);
      await refreshCard();
    } catch {
      toast.error('Failed to delete comment');
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-start justify-center z-50 overflow-y-auto py-10 px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="glass-modal rounded-2xl w-full max-w-2xl p-7 relative shadow-2xl"
        style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 transition-all"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-0)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-2)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Title ─────────────────────────────────────────── */}
        <div className="mb-7 pr-8">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') {
                  setTitle(card.title);
                  setEditingTitle(false);
                }
              }}
              className="input-dark text-xl font-bold w-full rounded-lg px-3 py-1.5 outline-none font-display"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-xl font-bold cursor-pointer rounded-lg px-2 py-1 -mx-2 font-display tracking-wide hover-surface"
              style={{ color: 'var(--text-0)' }}
            >
              {card.title}
            </h2>
          )}
        </div>

        {/* ── Labels ────────────────────────────────────────── */}
        <div className="mb-7">
          <p className="section-label mb-2.5">Labels</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {card.labels?.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{
                  backgroundColor: label.color,
                  boxShadow: `0 0 12px ${label.color}60`,
                  border: `1px solid ${label.color}80`,
                }}
              >
                {label.text}
                <button
                  onClick={() => handleDeleteLabel(label.id)}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/25"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>

          {showLabelForm ? (
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)' }}
            >
              <input
                type="text"
                placeholder="Label text"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                className="input-dark w-full rounded-lg px-3 py-1.5 text-sm mb-3"
              />
              <div className="flex gap-2 mb-3">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setLabelColor(color)}
                    className={`w-7 h-7 rounded-full color-swatch ${labelColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color, boxShadow: labelColor === color ? `0 0 10px ${color}80` : 'none' }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddLabel}
                  className="btn-primary px-4 py-1.5 rounded-lg text-xs"
                >
                  Add Label
                </button>
                <button
                  onClick={() => setShowLabelForm(false)}
                  className="btn-ghost px-3 py-1.5 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLabelForm(true)}
              className="btn-action text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Label
            </button>
          )}
        </div>

        {/* ── Due Date ──────────────────────────────────────── */}
        <div className="mb-7">
          <p className="section-label mb-2.5">Due Date</p>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => saveDueDate(e.target.value)}
              className="input-dark rounded-lg px-3 py-1.5 text-sm"
            />
            {card.dueDate && (
              <>
                <DueDateBadge date={card.dueDate} />
                <button
                  onClick={() => saveDueDate('')}
                  className="rounded-md p-1 transition-all"
                  style={{ color: 'var(--text-2)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#f87171';
                    e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-2)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Description ───────────────────────────────────── */}
        <div className="mb-7">
          <p className="section-label mb-2.5">Description</p>
          {editingDesc ? (
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                autoFocus
                className="input-dark w-full rounded-xl px-3 py-2.5 text-sm resize-y"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveDescription}
                  className="btn-primary px-4 py-1.5 rounded-lg text-xs"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setDescription(card.description || '');
                    setEditingDesc(false);
                  }}
                  className="btn-ghost px-3 py-1.5 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingDesc(true)}
              className="min-h-[60px] rounded-xl p-3 text-sm cursor-pointer transition-colors whitespace-pre-wrap"
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border-1)',
                color: card.description ? 'var(--text-0)' : 'var(--text-2)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-2)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-1)'}
            >
              {card.description || 'Add a more detailed description…'}
            </div>
          )}
        </div>

        {/* ── Checklists ────────────────────────────────────── */}
        <div className="mb-4">
          <p className="section-label mb-3">Checklists</p>

          {card.checklists?.map((checklist) => {
            const total = checklist.items?.length || 0;
            const checked = checklist.items?.filter((i) => i.checked).length || 0;
            const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

            return (
              <div
                key={checklist.id}
                className="mb-4 rounded-xl p-4"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display text-xs font-semibold tracking-wide" style={{ color: 'var(--text-0)' }}>
                    {checklist.title}
                  </h4>
                  <button
                    onClick={() => handleDeleteChecklist(checklist.id)}
                    className="text-xs px-2 py-0.5 rounded transition-all"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f87171';
                      e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-2)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Delete
                  </button>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs w-8 text-right" style={{ color: 'var(--text-2)' }}>{percent}%</span>
                  <div className="flex-1 h-1.5 progress-track">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent === 100 ? 'progress-fill-green' : 'progress-fill-indigo'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-3">
                  {checklist.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 group rounded-lg px-1.5 py-1 hover-row"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleItem(checklist.id, item.id)}
                        className="dark-check"
                      />
                      <span
                        className="flex-1 text-sm"
                        style={{
                          color: item.checked ? 'var(--text-2)' : 'var(--text-0)',
                          textDecoration: item.checked ? 'line-through' : 'none',
                        }}
                      >
                        {item.text}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(checklist.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-all"
                        style={{ color: 'var(--text-2)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#f87171';
                          e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-2)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add item */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an item…"
                    value={newItemTexts[checklist.id] || ''}
                    onChange={(e) =>
                      setNewItemTexts((prev) => ({ ...prev, [checklist.id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem(checklist.id)}
                    className="input-dark flex-1 rounded-lg px-2.5 py-1.5 text-sm"
                  />
                  <button
                    onClick={() => handleAddChecklistItem(checklist.id)}
                    className="btn-action px-3 py-1.5 rounded-lg text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}

          {showChecklistForm ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Checklist title…"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                autoFocus
                className="input-dark flex-1 rounded-lg px-3 py-1.5 text-sm"
              />
              <button
                onClick={handleAddChecklist}
                className="btn-primary px-4 py-1.5 rounded-lg text-xs"
              >
                Add
              </button>
              <button
                onClick={() => { setShowChecklistForm(false); setNewChecklistTitle(''); }}
                className="btn-ghost px-2 py-1.5 rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowChecklistForm(true)}
              className="btn-action text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Checklist
            </button>
          )}
        </div>

        {/* ── Comments ──────────────────────────────────────── */}
        <div>
          <p className="section-label mb-3">Comments</p>

          {/* Existing comments — newest first */}
          {card.comments && card.comments.length > 0 && (
            <div className="space-y-2 mb-4">
              {card.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl p-3 group"
                  style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {/* Mini avatar */}
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
                      >
                        {comment.author?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold font-display" style={{ color: 'var(--text-0)' }}>
                        {comment.author?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                        {timeAgo(comment.createdAt)}
                      </span>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-all"
                        style={{ color: 'var(--text-2)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#f87171';
                          e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-2)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed pl-7 whitespace-pre-wrap" style={{ color: 'var(--text-0)' }}>
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Post new comment */}
          <div className="flex gap-2 items-start">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment();
              }}
              placeholder="Write a comment…"
              rows={2}
              className="input-dark flex-1 rounded-xl px-3 py-2 text-sm resize-none"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="btn-primary px-4 py-2 rounded-xl text-xs flex-shrink-0 self-end"
              style={{ opacity: newComment.trim() ? 1 : 0.4 }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
