/**
 * useDeepLink — lightweight hash-based routing for Tauri
 *
 * Syncs app navigation state with window.location.hash so views can be
 * linked directly (e.g. #/graph, #/item/:id, #/project/:id).
 *
 * Supported routes:
 *   #/              → home
 *   #/graph         → graph view
 *   #/settings      → settings view
 *   #/item/:id      → home with item detail sheet open
 *   #/project/:id   → switch project, then home
 */
import { useState, useEffect, useCallback } from 'react'

/**
 * Parse the current hash into a route object.
 * @returns {{ view: string, itemId?: string, projectId?: string }}
 */
function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '') // strip #/ or #
  if (!hash || hash === '/') return { view: 'home' }

  const parts = hash.split('/')

  if (parts[0] === 'graph') return { view: 'graph' }
  if (parts[0] === 'settings') return { view: 'settings' }
  if (parts[0] === 'item' && parts[1]) return { view: 'home', itemId: parts[1] }
  if (parts[0] === 'project' && parts[1]) return { view: 'home', projectId: parts[1] }

  return { view: 'home' }
}

/**
 * Build a hash string from a route object.
 */
function buildHash(view, { itemId, projectId } = {}) {
  if (itemId) return `#/item/${itemId}`
  if (projectId) return `#/project/${projectId}`
  if (view === 'graph') return '#/graph'
  if (view === 'settings') return '#/settings'
  return '#/'
}

/**
 * Hook that provides deep-link-aware navigation.
 *
 * @returns {{
 *   view: string,
 *   initialItemId: string|null,
 *   initialProjectId: string|null,
 *   navigate: (view: string, opts?: { itemId?: string, projectId?: string }) => void,
 * }}
 */
export function useDeepLink() {
  const [route, setRoute] = useState(parseHash)

  // Listen for hash changes (back/forward buttons)
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Navigate: update hash (which triggers hashchange → state update)
  const navigate = useCallback((view, opts = {}) => {
    const newHash = buildHash(view, opts)
    if (window.location.hash !== newHash) {
      window.location.hash = newHash
    }
    // Also set state directly for instant UI update
    setRoute({ view, itemId: opts.itemId || null, projectId: opts.projectId || null })
  }, [])

  return {
    view: route.view,
    initialItemId: route.itemId || null,
    initialProjectId: route.projectId || null,
    navigate,
  }
}
