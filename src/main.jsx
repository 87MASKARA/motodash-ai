import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './i18n/LanguageContext';
import './index.css';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("MotoDash AI ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-7 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black font-racing uppercase text-amber-400">
              Reiniciando Cockpit...
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              Detectamos datos antiguos en caché. Haz clic abajo para restaurar el Demo en vivo.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold font-racing uppercase text-xs"
            >
              Restaurar Demo & Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </RootErrorBoundary>
  </React.StrictMode>
);
