import { useState, useEffect, useCallback, useRef } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

type BackendStatus = 'connecting' | 'ready' | 'error';

interface BackendErrorPayload {
  message: string;
}

interface UseBackendStatusReturn {
  status: BackendStatus;
  errorMessage: string | null;
  retry: () => void;
}

const HEALTH_URL = 'http://127.0.0.1:8080/health';
const POLL_INTERVAL_MS = 2000;

/**
 * Hook to monitor backend readiness via Tauri events and HTTP polling fallback.
 *
 * Listens for:
 * - `backend-ready`  → transitions to 'ready'
 * - `backend-error`  → transitions to 'error' with message
 *
 * Also polls GET /health every 2s while in 'connecting' state as a fallback.
 */
export function useBackendStatus(): UseBackendStatusReturn {
  const [status, setStatus] = useState<BackendStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use refs to track cleanup functions and polling interval
  const unlistenReadyRef = useRef<UnlistenFn | null>(null);
  const unlistenErrorRef = useRef<UnlistenFn | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const markReady = useCallback(() => {
    if (!mountedRef.current) return;
    setStatus('ready');
    setErrorMessage(null);
    stopPolling();
  }, [stopPolling]);

  const markError = useCallback((message: string) => {
    if (!mountedRef.current) return;
    setStatus('error');
    setErrorMessage(message);
    stopPolling();
  }, [stopPolling]);

  // Poll /health as a fallback
  const startPolling = useCallback(() => {
    stopPolling();

    const poll = async () => {
      try {
        const res = await fetch(HEALTH_URL, {
          method: 'GET',
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          markReady();
        }
      } catch {
        // Backend not ready yet — keep polling
      }
    };

    // Fire immediately, then on interval
    poll();
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }, [stopPolling, markReady]);

  // Set up Tauri event listeners
  const setupListeners = useCallback(async () => {
    // Clean up any existing listeners
    if (unlistenReadyRef.current) {
      unlistenReadyRef.current();
      unlistenReadyRef.current = null;
    }
    if (unlistenErrorRef.current) {
      unlistenErrorRef.current();
      unlistenErrorRef.current = null;
    }

    try {
      unlistenReadyRef.current = await listen('backend-ready', () => {
        markReady();
      });

      unlistenErrorRef.current = await listen<BackendErrorPayload>(
        'backend-error',
        (event) => {
          markError(event.payload?.message ?? 'Unknown backend error');
        },
      );
    } catch {
      // Tauri API may not be available (e.g. running in browser dev mode).
      // Polling fallback will still work.
    }
  }, [markReady, markError]);

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true;

    setupListeners();
    startPolling();

    return () => {
      mountedRef.current = false;
      stopPolling();

      // Clean up Tauri listeners
      unlistenReadyRef.current?.();
      unlistenReadyRef.current = null;
      unlistenErrorRef.current?.();
      unlistenErrorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retry: reset to connecting and restart everything
  const retry = useCallback(() => {
    setStatus('connecting');
    setErrorMessage(null);
    setupListeners();
    startPolling();
  }, [setupListeners, startPolling]);

  return { status, errorMessage, retry };
}

export default useBackendStatus;
