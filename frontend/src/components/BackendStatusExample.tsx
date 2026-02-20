/**
 * BackendStatusExample.tsx
 *
 * Demonstrates how to integrate the BackendStatus overlay into the app root.
 * The overlay renders on top of everything and automatically unmounts once
 * the backend is ready — no conditional logic needed in the app tree.
 *
 * Usage: Drop <BackendStatus /> at the top level of your component tree.
 * It uses a fixed z-[9999] overlay, so it layers above all other content.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { BackendStatus } from '@/components/BackendStatus';
import { SettingsProvider } from '@/contexts/SettingsContext';

// ─── Option A: Wrap alongside App (recommended) ─────────────────────────────
// The BackendStatus overlay is a sibling to App. It covers the screen while
// connecting and fades out when the backend is ready. App mounts immediately
// underneath so it can initialize in parallel.

function RootWithBackendCheck() {
  return (
    <>
      <BackendStatus />
      <App />
    </>
  );
}

// Example of how main.jsx / main.tsx would look:
//
// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <SettingsProvider>
//       <RootWithBackendCheck />
//     </SettingsProvider>
//   </StrictMode>,
// );

// ─── Option B: Gate rendering until ready ────────────────────────────────────
// If you prefer to NOT mount App at all until the backend is confirmed ready,
// use the hook directly:

import { useBackendStatus } from '@/hooks/useBackendStatus';

function GatedRoot() {
  const { status, errorMessage, retry } = useBackendStatus();

  if (status !== 'ready') {
    // BackendStatus handles its own UI for 'connecting' and 'error'
    return <BackendStatus />;
  }

  return <App />;
}

// ─── Exports ─────────────────────────────────────────────────────────────────
export { RootWithBackendCheck, GatedRoot };
export default RootWithBackendCheck;
