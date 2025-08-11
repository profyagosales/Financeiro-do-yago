import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import { Toaster } from './components/ui/Toasts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <>
        <App />
        <Toaster />
      </>
    </AppErrorBoundary>
  </StrictMode>
);

