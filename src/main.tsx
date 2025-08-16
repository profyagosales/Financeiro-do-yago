import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Font import removed; install '@fontsource-variable/inter' or re-add if desired

import App from '@/App'
import AppErrorBoundary from '@/components/AppErrorBoundary'

import '@/index.css'
import '@/styles/glass.css'
import { BrowserRouter } from 'react-router-dom'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.error('Service worker registration failed', err)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>
);

