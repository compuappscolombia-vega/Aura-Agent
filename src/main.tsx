import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and silence third-party browser extension errors (e.g. MetaMask, web3 injectors, Phantom)
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const filename = event.filename || '';
      const message = event.message || '';
      if (
        filename.includes('chrome-extension://') ||
        filename.includes('inpage.js') ||
        message.includes('MetaMask') ||
        message.includes('ethereum')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || '';
    const stack = reason?.stack || '';
    if (
      msg.includes('MetaMask') ||
      msg.includes('Failed to connect to MetaMask') ||
      msg.includes('ethereum') ||
      stack.includes('chrome-extension://') ||
      stack.includes('inpage.js')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

// Global React Error Boundary for resilient app recovery
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('AppErrorBoundary caught an issue:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-rose-400">Recuperación de Estado de AuraAgent</h2>
            <p className="text-xs text-slate-300">
              Se detectó una discrepancia temporal en la interfaz. Tus datos están a salvo en Firestore.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
