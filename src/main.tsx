import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
import AppErrorBoundary from './components/AppErrorBoundary'
import { Toaster } from './components/ui/Toasts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <>
        <App />
        <Toaster />
      </>
    </AppErrorBoundary>
  </StrictMode>,
)
