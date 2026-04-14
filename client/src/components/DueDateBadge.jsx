export default function DueDateBadge({ date }) {
  if (!date) return null;

  const dueDate = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const diffMs = dueDateNormalized.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let bgColor, textColor, glowColor;
  if (diffDays < 0) {
    bgColor = 'rgba(248,113,113,0.15)';
    textColor = '#f87171';
    glowColor = 'rgba(248,113,113,0.3)';
  } else if (diffDays === 0) {
    bgColor = 'rgba(234,179,8,0.15)';
    textColor = '#fbbf24';
    glowColor = 'rgba(234,179,8,0.3)';
  } else {
    bgColor = 'rgba(255,255,255,0.06)';
    textColor = 'var(--text-1)';
    glowColor = 'transparent';
  }

  const formatted = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
      style={{
        background: bgColor,
        color: textColor,
        border: `1px solid ${textColor === 'var(--text-1)' ? 'rgba(255,255,255,0.08)' : textColor + '40'}`,
        boxShadow: diffDays < 1 ? `0 0 8px ${glowColor}` : 'none',
      }}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {formatted}
    </span>
  );
}
