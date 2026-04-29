/**
 * API Client for Brian Knowledge Base
 */
import { getApiBaseUrl } from '@/lib/backend'

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${getApiBaseUrl()}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle 204 No Content
      if (response.status === 204) {
        return null
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }))
        throw new Error(error.detail || `API Error: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // ============================================================================
  // Knowledge Items
  // ============================================================================

  async getItems(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/items${query ? `?${query}` : ''}`)
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

  async updateItemPosition(id, x, y) {
    return this.request(`/items/${id}/position`, {
      method: 'PATCH',
      body: JSON.stringify({ x, y }),
    })
  }

  // ============================================================================
  // Search
  // ============================================================================

  async search(query, limit = 50) {
    return this.request(`/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  }

  // ============================================================================
  // Timeline
  // ============================================================================

  async getTimeline(startDate, endDate) {
    return this.request(
      `/timeline?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
    )
  }

  // ============================================================================
  // Tags
  // ============================================================================

  async getTags() {
    return this.request('/tags')
  }

  async getPopularTags(limit = 20) {
    return this.request(`/tags/popular?limit=${limit}`)
  }

  // ============================================================================
  // Connections (Graph)
  // ============================================================================

  async createConnection(data) {
    return this.request('/connections', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getItemConnections(id) {
    return this.request(`/connections/${id}`)
  }

  async getGraph() {
    return this.request('/graph')
  }

  async deleteConnection(id) {
    return this.request(`/connections/${id}`, {
      method: 'DELETE',
    })
  }

  // ============================================================================
  // Stats
  // ============================================================================

  async getStats() {
    return this.request('/stats')
  }
}

export const api = new ApiClient()

// Export convenience functions
export const updateItemPosition = (id, x, y) => api.updateItemPosition(id, x, y)
