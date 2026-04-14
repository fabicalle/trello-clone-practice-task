/**
 * Lightweight mock API server for UI screenshot/verification purposes.
 * Mimics the real server's response shape: { data: ... } for success.
 * Run with:  node mock-server.mjs
 */
import http from 'node:http';

const PORT = 4002;

// ─── In-memory state ────────────────────────────────────────────────────────
const USER = { id: 'u1', name: 'Fabian', email: 'test@example.com' };
const ACCESS_TOKEN = 'mock-access-token';

// Per-card in-memory comment store
const COMMENTS = {
  c1: [
    { id: 'cm3', text: 'Approved the new wireframes — moving to mockup phase.', cardId: 'c1', userId: 'u1', author: { id: 'u1', name: 'Fabian' }, createdAt: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: 'cm2', text: 'User testing scheduled for Thursday. @Sara can you prep the script?', cardId: 'c1', userId: 'u1', author: { id: 'u1', name: 'Fabian' }, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'cm1', text: 'Starting the onboarding redesign. Main pain points: too many steps, unclear progress indicator.', cardId: 'c1', userId: 'u1', author: { id: 'u1', name: 'Fabian' }, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ],
};

const BOARDS = [
  { id: 'b1', title: 'Product Roadmap', color: '#4f46e5', userId: 'u1' },
  { id: 'b2', title: 'Design System',   color: '#0891b2', userId: 'u1' },
  { id: 'b3', title: 'Bug Tracker',     color: '#dc2626', userId: 'u1' },
  { id: 'b4', title: 'Marketing Q2',    color: '#7c3aed', userId: 'u1' },
];

const BOARD_DETAIL = {
  id: 'b1',
  title: 'Product Roadmap',
  color: '#4f46e5',
  lists: [
    {
      id: 'l1', title: 'Backlog', position: 65536,
      cards: [
        {
          id: 'c1', title: 'Redesign onboarding flow', position: 65536,
          labels: [{ id: 'lb1', text: 'UX', color: '#c084fc' }, { id: 'lb2', text: 'High', color: '#f87171' }],
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          checklists: [{ id: 'cl1', title: 'Tasks', items: [
            { id: 'i1', text: 'Wireframes', checked: true },
            { id: 'i2', text: 'User testing', checked: false },
            { id: 'i3', text: 'Final mockup', checked: false },
          ]}],
          get comments() { return COMMENTS['c1'] || []; },
        },
        {
          id: 'c2', title: 'Audit accessibility issues', position: 131072,
          labels: [{ id: 'lb3', text: 'a11y', color: '#22c55e' }],
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          checklists: [],
        },
        {
          id: 'c3', title: 'Write API documentation', position: 196608,
          labels: [],
          dueDate: null,
          checklists: [],
        },
      ],
    },
    {
      id: 'l2', title: 'In Progress', position: 131072,
      cards: [
        {
          id: 'c4', title: 'Dark mode redesign', position: 65536,
          labels: [{ id: 'lb4', text: 'UI', color: '#22d3ee' }, { id: 'lb5', text: 'Sprint 4', color: '#eab308' }],
          dueDate: new Date().toISOString(),
          checklists: [{ id: 'cl2', title: 'Components', items: [
            { id: 'i4', text: 'Header', checked: true },
            { id: 'i5', text: 'Boards page', checked: true },
            { id: 'i6', text: 'Card modal', checked: false },
          ]}],
        },
        {
          id: 'c5', title: 'Implement drag & drop reorder', position: 131072,
          labels: [{ id: 'lb6', text: 'Feature', color: '#f97316' }],
          dueDate: null,
          checklists: [],
        },
      ],
    },
    {
      id: 'l3', title: 'Review', position: 196608,
      cards: [
        {
          id: 'c6', title: 'Performance audit — Lighthouse', position: 65536,
          labels: [{ id: 'lb7', text: 'Perf', color: '#22c55e' }],
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          checklists: [],
        },
      ],
    },
    {
      id: 'l4', title: 'Done', position: 262144,
      cards: [
        {
          id: 'c7', title: 'Set up CI/CD pipeline', position: 65536,
          labels: [{ id: 'lb8', text: 'DevOps', color: '#818cf8' }],
          dueDate: null,
          checklists: [],
        },
        {
          id: 'c8', title: 'Database schema v1', position: 131072,
          labels: [],
          dueDate: null,
          checklists: [],
        },
      ],
    },
  ],
};

// ─── Router ──────────────────────────────────────────────────────────────────
function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5174',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Set-Cookie': status === 200 && body?.data?.accessToken
      ? 'refreshToken=mock-refresh; HttpOnly; Path=/'
      : '',
  });
  res.end(json);
}

async function body(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': 'http://localhost:5174',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    });
    return res.end();
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (url === '/api/v1/auth/login' && method === 'POST') {
    return send(res, 200, { data: { accessToken: ACCESS_TOKEN, user: USER } });
  }
  if (url === '/api/v1/auth/register' && method === 'POST') {
    return send(res, 201, { data: { accessToken: ACCESS_TOKEN, user: USER } });
  }
  if (url === '/api/v1/auth/logout' && method === 'POST') {
    return send(res, 200, { data: {} });
  }
  if (url === '/api/v1/auth/refresh' && method === 'POST') {
    return send(res, 200, { data: { accessToken: ACCESS_TOKEN, user: USER } });
  }
  if (url === '/api/v1/auth/me' && method === 'GET') {
    return send(res, 200, { data: { user: USER } });
  }

  // ── Boards ────────────────────────────────────────────────────────────────
  if (url === '/api/v1/boards' && method === 'GET') {
    return send(res, 200, { data: BOARDS });
  }
  if (url === '/api/v1/boards' && method === 'POST') {
    const b = await body(req);
    const nb = { id: 'b' + Date.now(), title: b.title || 'New Board', color: b.color || '#4f46e5', userId: 'u1' };
    BOARDS.push(nb);
    return send(res, 201, { data: nb });
  }
  if (url.match(/^\/api\/v1\/boards\/[^/]+$/) && method === 'GET') {
    return send(res, 200, { data: BOARD_DETAIL });
  }
  if (url.match(/^\/api\/v1\/boards\/[^/]+$/) && method === 'DELETE') {
    return send(res, 200, { data: {} });
  }

  // ── Lists ─────────────────────────────────────────────────────────────────
  if (url.match(/^\/api\/v1\/boards\/[^/]+\/lists$/) && method === 'POST') {
    const b = await body(req);
    return send(res, 201, { data: { id: 'l' + Date.now(), title: b.title, position: 999999, cards: [] } });
  }
  if (url.match(/^\/api\/v1\/boards\/[^/]+\/lists\/[^/]+$/) && method === 'PATCH') {
    const b = await body(req);
    return send(res, 200, { data: { title: b.title } });
  }
  if (url.match(/^\/api\/v1\/boards\/[^/]+\/lists\/[^/]+$/) && method === 'DELETE') {
    return send(res, 200, { data: {} });
  }
  if (url.match(/^\/api\/v1\/boards\/[^/]+\/lists\/[^/]+\/move$/) && method === 'PATCH') {
    return send(res, 200, { data: {} });
  }

  // ── Cards ─────────────────────────────────────────────────────────────────
  if (url.match(/^\/api\/v1\/lists\/[^/]+\/cards$/) && method === 'POST') {
    const b = await body(req);
    return send(res, 201, { data: { id: 'c' + Date.now(), title: b.title, position: 999999, labels: [], checklists: [], dueDate: null } });
  }
  if (url.match(/^\/api\/v1\/lists\/[^/]+\/cards\/[^/]+$/) && method === 'PATCH') {
    const b = await body(req);
    return send(res, 200, { data: { ...b } });
  }
  if (url.match(/^\/api\/v1\/cards\/[^/]+$/) && method === 'GET') {
    return send(res, 200, { data: BOARD_DETAIL.lists[0].cards[0] });
  }

  // ── Card details ──────────────────────────────────────────────────────────
  if (url.match(/\/labels$/) && method === 'POST') {
    return send(res, 201, { data: { id: 'lb' + Date.now() } });
  }
  if (url.match(/\/labels\/[^/]+$/) && method === 'DELETE') {
    return send(res, 200, { data: {} });
  }
  if (url.match(/\/checklists$/) && method === 'POST') {
    return send(res, 201, { data: { id: 'cl' + Date.now(), items: [] } });
  }
  if (url.match(/\/checklists\/[^/]+$/) && method === 'DELETE') {
    return send(res, 200, { data: {} });
  }
  if (url.match(/\/checklists\/[^/]+\/items$/) && method === 'POST') {
    return send(res, 201, { data: { id: 'i' + Date.now(), checked: false } });
  }
  if (url.match(/\/items\/[^/]+\/toggle$/) && method === 'PATCH') {
    return send(res, 200, { data: {} });
  }
  if (url.match(/\/items\/[^/]+$/) && method === 'DELETE') {
    return send(res, 200, { data: {} });
  }

  // ── Comments ──────────────────────────────────────────────────────────────
  const commentListMatch = url.match(/^\/api\/v1\/cards\/([^/]+)\/comments$/);
  if (commentListMatch && method === 'GET') {
    const cardId = commentListMatch[1];
    return send(res, 200, { data: COMMENTS[cardId] || [] });
  }
  if (commentListMatch && method === 'POST') {
    const cardId = commentListMatch[1];
    const b = await body(req);
    const comment = {
      id: 'cm' + Date.now(),
      text: b.text || '',
      cardId,
      userId: 'u1',
      author: { id: 'u1', name: 'Fabian' },
      createdAt: new Date().toISOString(),
    };
    if (!COMMENTS[cardId]) COMMENTS[cardId] = [];
    COMMENTS[cardId].unshift(comment);
    return send(res, 201, { data: comment });
  }
  if (url.match(/^\/api\/v1\/cards\/[^/]+\/comments\/[^/]+$/) && method === 'DELETE') {
    const parts = url.split('/');
    const cardId = parts[4];
    const commentId = parts[6];
    if (COMMENTS[cardId]) {
      COMMENTS[cardId] = COMMENTS[cardId].filter(c => c.id !== commentId);
    }
    return send(res, 200, { data: {} });
  }

  // 404
  console.warn(`[mock] unhandled: ${method} ${url}`);
  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});
