/**
 * API Client for brian backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api/v1'

class BrianAPI {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'API request failed')
      }

      if (response.status === 204) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Items
  async getItems(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.item_type) params.append('item_type', filters.item_type)
    if (filters.favorite_only) params.append('favorite_only', 'true')
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.offset) params.append('offset', filters.offset)
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_order) params.append('sort_order', filters.sort_order)
    if (filters.project_id) params.append('project_id', filters.project_id)

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/items${query}`)
  }

  async getItem(id) {
    return this.request(`/items/${id}`)
  }

  async createItem(data) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateItem(id, data) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteItem(id) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    })
  }

  async toggleFavorite(id) {
    return this.request(`/items/${id}/favorite`, {
      method: 'POST',
    })
  }

  async voteItem(id, direction) {
    return this.request(`/items/${id}/vote?direction=${direction}`, {
      method: 'POST',
    })
  }

  // Search
  async search(query, limit = 50) {
    const params = new URLSearchParams({ q: query, limit })
    return this.request(`/search?${params.toString()}`)
  }

  // Timeline
  async getTimeline(startDate, endDate) {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    })
    return this.request(`/timeline?${params.toString()}`)
  }

  // Tags
  async getTags() {
    return this.request('/tags')
  }

  async getPopularTags(limit = 20) {
    return this.request(`/tags/popular?limit=${limit}`)
  }

  // Connections
  async createConnection(data) {
    return this.request('/connections', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getItemConnections(itemId) {
    return this.request(`/connections/${itemId}`)
  }

  async getGraph() {
    return this.request('/graph')
  }

  async deleteConnection(id) {
    return this.request(`/connections/${id}`, {
      method: 'DELETE',
    })
  }

  // Stats
  async getStats() {
    return this.request('/stats')
  }

  // ============================================================================
  // Regions
  // ============================================================================

  async getRegions(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.region_type) params.append('region_type', filters.region_type)
    if (filters.visible_only) params.append('visible_only', 'true')
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.offset) params.append('offset', filters.offset)
    if (filters.project_id) params.append('project_id', filters.project_id)

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/regions${query}`)
  }

  async getRegion(id) {
    return this.request(`/regions/${id}`)
  }

  async getRegionItems(id) {
    return this.request(`/regions/${id}/items`)
  }

  async createRegion(data) {
    return this.request('/regions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRegion(id, data) {
    return this.request(`/regions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteRegion(id) {
    return this.request(`/regions/${id}`, {
      method: 'DELETE',
    })
  }

  async addItemsToRegion(regionId, itemIds) {
    return this.request(`/regions/${regionId}/items`, {
      method: 'POST',
      body: JSON.stringify({ item_ids: itemIds }),
    })
  }

  async removeItemFromRegion(regionId, itemId) {
    return this.request(`/regions/${regionId}/items/${itemId}`, {
      method: 'DELETE',
    })
  }

  async toggleRegionVisibility(id) {
    return this.request(`/regions/${id}/visibility`, {
      method: 'POST',
    })
  }

  async getItemRegions(itemId) {
    return this.request(`/items/${itemId}/regions`)
  }

  // ============================================================================
  // Projects (Knowledge Bases)
  // ============================================================================

  async getProjects(includeArchived = false) {
    const params = new URLSearchParams()
    if (includeArchived) params.append('include_archived', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/projects${query}`)
  }

  async getProject(id) {
    return this.request(`/projects/${id}`)
  }

  async getDefaultProject() {
    return this.request('/projects/default')
  }

  async getProjectStats(id) {
    return this.request(`/projects/${id}/stats`)
  }

  async createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProject(id, data) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async setDefaultProject(id) {
    return this.request(`/projects/${id}/default`, {
      method: 'POST',
    })
  }

  async archiveProject(id) {
    return this.request(`/projects/${id}/archive`, {
      method: 'POST',
    })
  }

  async unarchiveProject(id) {
    return this.request(`/projects/${id}/unarchive`, {
      method: 'POST',
    })
  }

  async updateProjectAccess(id) {
    return this.request(`/projects/${id}/access`, {
      method: 'POST',
    })
  }
}

export const api = new BrianAPI()
