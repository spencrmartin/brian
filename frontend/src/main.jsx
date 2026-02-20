import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from './contexts/SettingsContext'
import { BackendStatus } from './components/BackendStatus'
import { useBackendStatus } from './hooks/useBackendStatus'

/**
 * Gates the App behind backend readiness.
 * BackendStatus overlay shows while connecting/error.
 * App only mounts once the backend is confirmed healthy,
 * preventing "Error loading items" on startup.
 */
function Root() {
  const { status } = useBackendStatus()

  return (
    <>
      <BackendStatus />
      {status === 'ready' && <App />}
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <Root />
    </SettingsProvider>
  </StrictMode>,
)
