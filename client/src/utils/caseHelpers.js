/**
 * Utility functions for case-related operations
 */

export const RATING_LEVELS = {
  DEFAULT: 'default',
  GOOD: 'good',
  GREAT: 'great',
  EXCELLENT: 'excellent'
}

// Case styling utilities
export const getCaseGradient = (caseId) => {
  const gradients = {
    'random': 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
    'cocktails': 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500',
    'shots': 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-500',
    'champagnedrinkar': 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500',
    'drinkar': 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
    'longdrinks': 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500'
  }
  return gradients[caseId] || 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
}

export const getCaseIcon = (caseId) => {
  const icons = {
    'random': '🎲',
    'cocktails': '🍸',
    'shots': '🥃',
    'champagnedrinkar': '🥂',
    'drinkar': '🍹',
    'longdrinks': '🍹'
  }
  return icons[caseId] || '📦'
}

export const getCaseTitle = (caseId) => {
  const titles = {
    'random': 'Mixed Case',
    'cocktails': 'Cocktails Case',
    'shots': 'Shots Case',
    'champagnedrinkar': 'Champagne Case',
    'drinkar': 'Drinks Case',
    'longdrinks': 'Long Drinks Case'
  }
  return titles[caseId] || 'Drink Case'
}

export const getCaseBadgeColor = (caseId) => {
  const colors = {
    'random': 'bg-orange-500/20 text-orange-200 border border-orange-500/50',
    'cocktails': 'bg-purple-500/20 text-purple-200 border border-purple-500/50',
    'shots': 'bg-red-500/20 text-red-200 border border-red-500/50',
    'champagnedrinkar': 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/50',
    'drinkar': 'bg-blue-500/20 text-blue-200 border border-blue-500/50',
    'longdrinks': 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50'
  }
  return colors[caseId] || 'bg-gray-500/20 text-gray-200 border border-gray-500/50'
}

// Rating styling utilities
export const getRatingColor = (rating) => {
  if (!rating) return 'text-gray-400'
  
  if (rating >= 4.5) return 'text-purple-400'  // Excellent (4.5+ stars)
  if (rating >= 4.0) return 'text-blue-400'    // Great (4.0-4.4 stars)
  if (rating >= 3.5) return 'text-green-400'   // Good (3.5-3.9 stars)
  return 'text-gray-400'                        // Default (below 3.5 stars)
}

// Get rating level from numeric rating
export const getRatingLevel = (rating) => {
  if (!rating) return RATING_LEVELS.DEFAULT
  
  if (rating >= 4.5) return RATING_LEVELS.EXCELLENT
  if (rating >= 4.0) return RATING_LEVELS.GREAT
  if (rating >= 3.5) return RATING_LEVELS.GOOD
  return RATING_LEVELS.DEFAULT
}

// API utilities
export const createApiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  // Use environment variable for API URL, fallback to relative URL
  const baseUrl = import.meta.env.VITE_API_URL || '/api'

  const response = await fetch(`${baseUrl}${endpoint}`, {
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
}

// Validation utilities
export const isValidCaseType = (caseType) => {
  // Accept any string as a valid case type since they come from the server dynamically
  return typeof caseType === 'string' && caseType.length > 0
}

export const isValidRating = (rating) => {
  return typeof rating === 'number' && rating >= 0 && rating <= 5
}
