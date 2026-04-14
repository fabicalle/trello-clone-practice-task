import { Draggable } from '@hello-pangea/dnd';
import DueDateBadge from './DueDateBadge.jsx';

export default function CardTile({ card, index, onClick }) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`rounded-lg p-2.5 mb-2 cursor-pointer neon-card ${snapshot.isDragging ? 'is-dragging-card' : ''}`}
          style={{
            background: 'var(--bg-3)',
            border: '1px solid var(--border-1)',
            ...(provided.draggableProps.style || {}),
          }}
        >
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {card.labels.map((label) => (
                <span
                  key={label.id}
                  className="h-1.5 rounded-full inline-block min-w-[24px]"
                  style={{ backgroundColor: label.color, boxShadow: `0 0 6px ${label.color}80` }}
                  title={label.text}
                />
              ))}
            </div>
          )}

          <p className="text-sm leading-snug" style={{ color: 'var(--text-0)' }}>
            {card.title}
          </p>

          {(card.dueDate || (card.checklists && card.checklists.length > 0)) && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {card.dueDate && <DueDateBadge date={card.dueDate} />}
              {card.checklists && card.checklists.length > 0 && (
                <span
                  className="text-xs flex items-center gap-1 px-1.5 py-0.5 rounded"
                  style={{
                    color: 'var(--text-1)',
                    background: 'var(--bg-4)',
                    border: '1px solid var(--border-1)',
                  }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {card.checklists.reduce(
                    (acc, cl) => acc + (cl.items?.filter((i) => i.checked).length || 0),
                    0
                  )}
                  /
                  {card.checklists.reduce(
                    (acc, cl) => acc + (cl.items?.length || 0),
                    0
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
