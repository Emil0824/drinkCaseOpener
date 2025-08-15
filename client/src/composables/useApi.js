/**
 * Composable for API operations
 * Provides reusable methods for making API calls with consistent error handling
 */

import { ref, computed } from 'vue'

export function useApi() {
  const isLoading = ref(false)
  const error = ref(null)

  const makeRequest = async (endpoint, options = {}) => {
    isLoading.value = true
    error.value = null

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    try {
      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed')
      }

      return data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const get = (endpoint) => makeRequest(endpoint)
  
  const post = (endpoint, body) => makeRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const put = (endpoint, body) => makeRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  })

  const del = (endpoint) => makeRequest(endpoint, {
    method: 'DELETE'
  })

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    makeRequest,
    get,
    post,
    put,
    delete: del
  }
}

// Helper function for readonly refs
function readonly(ref) {
  return computed(() => ref.value)
}
