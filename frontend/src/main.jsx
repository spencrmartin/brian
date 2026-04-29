import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from './contexts/SettingsContext'
import { BackendStatus } from './components/BackendStatus'
import { Onboarding } from './components/Onboarding'
import { useBackendStatus } from './hooks/useBackendStatus'
import { useOnboarding } from './hooks/useOnboarding'

/**
 * Root component that manages the startup flow:
 * 1. BackendStatus overlay while sidecar starts
 * 2. Onboarding flow for first-time users (empty knowledge base)
 * 3. Main App once everything is ready
 */
function Root() {
  const { status } = useBackendStatus()
  const { showOnboarding, isLoading: onboardingLoading, completeOnboarding } = useOnboarding()

  // Show backend loading overlay until healthy
  if (status !== 'ready') {
    return <BackendStatus />
  }

  // Once backend is ready, check if we need onboarding
  if (onboardingLoading) {
    return null // Brief flash while checking stats
  }

  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <Root />
    </SettingsProvider>
  </StrictMode>,
)
