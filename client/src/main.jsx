import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141428',
              color: '#e4e8f8',
              border: '1px solid rgba(255,255,255,0.10)',
              fontSize: '0.85rem',
              fontFamily: "'Barlow', sans-serif",
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#07070d' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#07070d' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
