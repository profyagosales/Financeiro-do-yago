import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'

import App from '@/App'
import AppErrorBoundary from '@/components/AppErrorBoundary'
import { Toaster } from '@/components/ui/Toasts'
import '@/index.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.error('Service worker registration failed', err)
  })
}

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

