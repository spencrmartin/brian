import { useState, useEffect, useCallback, useRef } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { setBackendPort, getBackendUrl } from '@/lib/backend';

type BackendStatus = 'connecting' | 'ready' | 'error';

interface UseBackendStatusReturn {
  status: BackendStatus;
  errorMessage: string | null;
  retry: () => void;
}

const POLL_INTERVAL_MS = 2000;

/**
 * Hook to monitor backend readiness via Tauri events and HTTP polling fallback.
 *
 * Listens for:
 * - `backend-ready`  → payload is the port number; transitions to 'ready'
 * - `backend-error`  → transitions to 'error' with message
 *
 * Also polls GET /health every 2s while in 'connecting' state as a fallback.
 * When the backend is discovered (via event or poll), the port is stored
 * globally so all API clients use the correct URL.
 */
export function useBackendStatus(): UseBackendStatusReturn {
  const [status, setStatus] = useState<BackendStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const markReady = useCallback((port?: number) => {
    if (!mountedRef.current) return;
    if (port) {
      setBackendPort(port);
    }
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

  // Poll /health as a fallback (tries default port)
  const startPolling = useCallback(() => {
    stopPolling();

    const poll = async () => {
      try {
        const healthUrl = `${getBackendUrl()}/health`;
        const res = await fetch(healthUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          const data = await res.json();
          // If the health response includes a port, use it
          if (data.port) {
            setBackendPort(data.port);
          }
          markReady(data.port);
        }
      } catch {
        // Backend not ready yet — keep polling
      }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }, [stopPolling, markReady]);

  // Set up Tauri event listeners
  const setupListeners = useCallback(async () => {
    if (unlistenReadyRef.current) {
      unlistenReadyRef.current();
      unlistenReadyRef.current = null;
    }
    if (unlistenErrorRef.current) {
      unlistenErrorRef.current();
      unlistenErrorRef.current = null;
    }

    try {
      // backend-ready event payload is the port number
      unlistenReadyRef.current = await listen<number>('backend-ready', (event) => {
        markReady(event.payload);
      });

      unlistenErrorRef.current = await listen<string>(
        'backend-error',
        (event) => {
          markError(event.payload ?? 'Unknown backend error');
        },
      );
    } catch {
      // Tauri API may not be available (e.g. running in browser dev mode).
      // Polling fallback will still work.
    }
  }, [markReady, markError]);

  useEffect(() => {
    mountedRef.current = true;

    setupListeners();
    startPolling();

    return () => {
      mountedRef.current = false;
      stopPolling();
      unlistenReadyRef.current?.();
      unlistenReadyRef.current = null;
      unlistenErrorRef.current?.();
      unlistenErrorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => {
    setStatus('connecting');
    setErrorMessage(null);
    setupListeners();
    startPolling();
  }, [setupListeners, startPolling]);

  return { status, errorMessage, retry };
}

export default useBackendStatus;
