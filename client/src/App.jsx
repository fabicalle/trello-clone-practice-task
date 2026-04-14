import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BoardsPage from './pages/BoardsPage.jsx';
import BoardView from './pages/BoardView.jsx';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#07070d' }}>
      <div className="relative w-10 h-10">
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#818cf8',
            borderRightColor: '#22d3ee',
          }}
        />
        <div
          className="absolute inset-1 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)' }}
        />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  return user ? <Navigate to="/boards" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/boards"
        element={
          <ProtectedRoute>
            <BoardsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boards/:id"
        element={
          <ProtectedRoute>
            <BoardView />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
