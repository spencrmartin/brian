import { create } from 'zustand'
import { api } from '../api/client'

export const useStore = create((set, get) => ({
  // Items state
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  
  // Filters
  filters: {
    item_type: null,
    favorite_only: false,
    sort_by: 'created_at',
    sort_order: 'DESC',
  },
  
  // Stats
  stats: {
    total_items: 0,
    total_tags: 0,
    total_connections: 0,
    by_type: {},
    favorites: 0,
  },
  
  // Regions state
  regions: [],
  selectedRegion: null,
  regionsLoading: false,
  
  // Projects state
  projects: [],
  currentProject: null,
  projectsLoading: false,
  
  // UI state
  currentView: 'feed',
  isModalOpen: false,
  editingItemId: null,
  
  // Actions
  setView: (view) => set({ currentView: view }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  openModal: (itemId = null) => set({
    isModalOpen: true,
    editingItemId: itemId,
  }),
  
  closeModal: () => set({
    isModalOpen: false,
    editingItemId: null,
  }),
  
  // Fetch items
  fetchItems: async () => {
    set({ loading: true, error: null })
    try {
      const currentProject = get().currentProject
      const filters = { ...get().filters }
      // Add project_id filter if we have a current project
      if (currentProject?.id) {
        filters.project_id = currentProject.id
      }
      const items = await api.getItems(filters)
      set({ items, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  // Fetch single item
  fetchItem: async (id) => {
    set({ loading: true, error: null })
    try {
      const item = await api.getItem(id)
      set({ currentItem: item, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  // Create item
  createItem: async (data) => {
    set({ loading: true, error: null })
    try {
      await api.createItem(data)
      await get().fetchItems()
      await get().fetchStats()
      set({ loading: false })
      get().closeModal()
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },
  
  // Update item
  updateItem: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await api.updateItem(id, data)
      await get().fetchItems()
      set({ loading: false })
      get().closeModal()
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },
  
  // Delete item
  deleteItem: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.deleteItem(id)
      await get().fetchItems()
      await get().fetchStats()
      set({ loading: false })
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },
  
  // Toggle favorite
  toggleFavorite: async (id) => {
    try {
      await api.toggleFavorite(id)
      await get().fetchItems()
    } catch (error) {
      set({ error: error.message })
    }
  },
  
  // Vote
  voteItem: async (id, direction) => {
    try {
      await api.voteItem(id, direction)
      await get().fetchItems()
    } catch (error) {
      set({ error: error.message })
    }
  },
  
  // Search
  searchItems: async (query) => {
    set({ loading: true, error: null })
    try {
      const items = await api.search(query)
      set({ items, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  // Fetch stats
  fetchStats: async () => {
    try {
      const stats = await api.getStats()
      set({ stats })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  },

  // ============================================================================
  // Region Actions
  // ============================================================================

  // Set selected region
  setSelectedRegion: (region) => set({ selectedRegion: region }),

  // Fetch all regions
  fetchRegions: async (filters = {}) => {
    set({ regionsLoading: true })
    try {
      const currentProject = get().currentProject
      const regionFilters = { ...filters }
      // Add project_id filter if we have a current project
      if (currentProject?.id) {
        regionFilters.project_id = currentProject.id
      }
      const regions = await api.getRegions(regionFilters)
      set({ regions, regionsLoading: false })
    } catch (error) {
      console.error('Failed to fetch regions:', error)
      set({ regionsLoading: false })
    }
  },

  // Fetch single region
  fetchRegion: async (id) => {
    try {
      const region = await api.getRegion(id)
      set({ selectedRegion: region })
      return region
    } catch (error) {
      console.error('Failed to fetch region:', error)
      return null
    }
  },

  // Create region
  createRegion: async (data) => {
    set({ regionsLoading: true })
    try {
      const region = await api.createRegion(data)
      await get().fetchRegions()
      set({ regionsLoading: false })
      return region
    } catch (error) {
      console.error('Failed to create region:', error)
      set({ regionsLoading: false })
      return null
    }
  },

  // Update region
  updateRegion: async (id, data) => {
    try {
      const region = await api.updateRegion(id, data)
      await get().fetchRegions()
      // Update selectedRegion if it's the one being updated
      if (get().selectedRegion?.id === id) {
        set({ selectedRegion: region })
      }
      return region
    } catch (error) {
      console.error('Failed to update region:', error)
      return null
    }
  },

  // Delete region
  deleteRegion: async (id) => {
    try {
      await api.deleteRegion(id)
      await get().fetchRegions()
      // Clear selectedRegion if it's the one being deleted
      if (get().selectedRegion?.id === id) {
        set({ selectedRegion: null })
      }
      return true
    } catch (error) {
      console.error('Failed to delete region:', error)
      return false
    }
  },

  // Add items to region
  addItemsToRegion: async (regionId, itemIds) => {
    try {
      const region = await api.addItemsToRegion(regionId, itemIds)
      await get().fetchRegions()
      if (get().selectedRegion?.id === regionId) {
        set({ selectedRegion: region })
      }
      return region
    } catch (error) {
      console.error('Failed to add items to region:', error)
      return null
    }
  },

  // Remove item from region
  removeItemFromRegion: async (regionId, itemId) => {
    try {
      await api.removeItemFromRegion(regionId, itemId)
      await get().fetchRegions()
      // Refresh selectedRegion if needed
      if (get().selectedRegion?.id === regionId) {
        const region = await api.getRegion(regionId)
        set({ selectedRegion: region })
      }
      return true
    } catch (error) {
      console.error('Failed to remove item from region:', error)
      return false
    }
  },

  // Toggle region visibility
  toggleRegionVisibility: async (id) => {
    try {
      const region = await api.toggleRegionVisibility(id)
      await get().fetchRegions()
      if (get().selectedRegion?.id === id) {
        set({ selectedRegion: region })
      }
      return region
    } catch (error) {
      console.error('Failed to toggle region visibility:', error)
      return null
    }
  },

  // Get regions for a specific item
  getItemRegions: async (itemId) => {
    try {
      return await api.getItemRegions(itemId)
    } catch (error) {
      console.error('Failed to get item regions:', error)
      return []
    }
  },

  // ============================================================================
  // Project Actions
  // ============================================================================

  // Fetch all projects
  fetchProjects: async (includeArchived = false) => {
    set({ projectsLoading: true })
    try {
      const projects = await api.getProjects(includeArchived)
      set({ projects, projectsLoading: false })
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      set({ projectsLoading: false })
    }
  },

  // Fetch current/default project
  fetchCurrentProject: async () => {
    try {
      const project = await api.getDefaultProject()
      set({ currentProject: project })
      // Store in localStorage for persistence
      localStorage.setItem('brian_current_project', project.id)
      return project
    } catch (error) {
      console.error('Failed to fetch current project:', error)
      return null
    }
  },

  // Switch to a different project
  switchProject: async (projectId) => {
    set({ projectsLoading: true })
    try {
      await api.setDefaultProject(projectId)
      await api.updateProjectAccess(projectId)
      const project = await api.getProject(projectId)
      set({ currentProject: project, projectsLoading: false })
      // Store in localStorage for persistence
      localStorage.setItem('brian_current_project', projectId)
      // Refresh items for the new project context
      await get().fetchItems()
      await get().fetchRegions()
      await get().fetchStats()
      return project
    } catch (error) {
      console.error('Failed to switch project:', error)
      set({ projectsLoading: false })
      return null
    }
  },

  // Create a new project
  createProject: async (data) => {
    set({ projectsLoading: true })
    try {
      const project = await api.createProject(data)
      await get().fetchProjects()
      set({ projectsLoading: false })
      return project
    } catch (error) {
      console.error('Failed to create project:', error)
      set({ projectsLoading: false })
      return null
    }
  },

  // Update a project
  updateProject: async (id, data) => {
    try {
      const project = await api.updateProject(id, data)
      await get().fetchProjects()
      // Update currentProject if it's the one being updated
      if (get().currentProject?.id === id) {
        set({ currentProject: project })
      }
      return project
    } catch (error) {
      console.error('Failed to update project:', error)
      return null
    }
  },

  // Delete a project
  deleteProject: async (id) => {
    try {
      await api.deleteProject(id)
      await get().fetchProjects()
      // If deleted project was current, switch to default
      if (get().currentProject?.id === id) {
        await get().fetchCurrentProject()
      }
      return true
    } catch (error) {
      console.error('Failed to delete project:', error)
      return false
    }
  },

  // Archive a project
  archiveProject: async (id) => {
    try {
      await api.archiveProject(id)
      await get().fetchProjects()
      return true
    } catch (error) {
      console.error('Failed to archive project:', error)
      return false
    }
  },

  // Unarchive a project
  unarchiveProject: async (id) => {
    try {
      await api.unarchiveProject(id)
      await get().fetchProjects()
      return true
    } catch (error) {
      console.error('Failed to unarchive project:', error)
      return false
    }
  },

  // Get project stats
  getProjectStats: async (id) => {
    try {
      return await api.getProjectStats(id)
    } catch (error) {
      console.error('Failed to get project stats:', error)
      return null
    }
  },
}))
