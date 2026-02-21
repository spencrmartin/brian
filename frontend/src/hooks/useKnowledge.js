/**
 * Custom hook for managing knowledge items
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/store/useStore'

export function useKnowledge() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const initialLoadDone = useRef(false)
  
  // Get project filtering state from store
  const { currentProject, viewAllProjects } = useStore()

  // Load all items with project filtering (auto-retries on failure)
  const loadItems = useCallback(async (params = {}) => {
    const MAX_RETRIES = 3
    const RETRY_DELAY = 1000 // ms
    
    setLoading(true)
    setError(null)
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Apply project filter if not viewing all projects
        const queryParams = { ...params }
        if (currentProject?.id && !viewAllProjects) {
          queryParams.project_id = currentProject.id
        }
        
        const data = await api.getItems(queryParams)
        setItems(data)
        setError(null)
        setLoading(false)
        initialLoadDone.current = true
        return // Success — exit
      } catch (err) {
        console.error(`Failed to load items (attempt ${attempt}/${MAX_RETRIES}):`, err)
        if (attempt === MAX_RETRIES) {
          setError(err)
          setLoading(false)
          initialLoadDone.current = true
        } else {
          // Wait before retrying — backend port may still be resolving
          await new Promise(r => setTimeout(r, RETRY_DELAY))
        }
      }
    }
  }, [currentProject?.id, viewAllProjects])

  // Initial load and reload when project filter changes
  useEffect(() => {
    loadItems()
  }, [currentProject?.id, viewAllProjects])

  // Listen for custom reload events (e.g. after image upload in NewItemDialog)
  useEffect(() => {
    const handler = () => loadItems()
    window.addEventListener('brian-items-changed', handler)
    return () => window.removeEventListener('brian-items-changed', handler)
  }, [loadItems])

  // Create new item
  const createItem = async (data) => {
    try {
      const newItem = await api.createItem(data)
      setItems([newItem, ...items])
      return newItem
    } catch (err) {
      console.error('Failed to create item:', err)
      throw err
    }
  }

  // Update existing item
  const updateItem = async (id, data) => {
    try {
      const updated = await api.updateItem(id, data)
      setItems(items.map(item => item.id === id ? updated : item))
      return updated
    } catch (err) {
      console.error('Failed to update item:', err)
      throw err
    }
  }

  // Delete item
  const deleteItem = async (id) => {
    try {
      await api.deleteItem(id)
      setItems(items.filter(item => item.id !== id))
    } catch (err) {
      console.error('Failed to delete item:', err)
      throw err
    }
  }

  // Toggle favorite
  const toggleFavorite = async (id) => {
    try {
      const updated = await api.toggleFavorite(id)
      setItems(items.map(item => item.id === id ? updated : item))
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      throw err
    }
  }

  // Vote on item
  const voteItem = async (id, direction) => {
    try {
      const updated = await api.voteItem(id, direction)
      setItems(items.map(item => item.id === id ? updated : item))
    } catch (err) {
      console.error('Failed to vote:', err)
      throw err
    }
  }

  // Search items (respects project filter)
  const searchItems = async (query) => {
    try {
      setLoading(true)
      setError(null)
      const results = await api.search(query)
      
      // Filter results by project if not viewing all projects
      let filteredResults = results
      if (currentProject?.id && !viewAllProjects) {
        filteredResults = results.filter(item => item.project_id === currentProject.id)
      }
      
      setItems(filteredResults)
    } catch (err) {
      setError(err)
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    voteItem,
    searchItems,
  }
}
