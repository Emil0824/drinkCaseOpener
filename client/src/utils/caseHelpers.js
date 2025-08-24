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
export const getCaseGradient = (caseId, serverColor = null) => {
  // If server provided a color, generate gradient from it
  if (serverColor) {
    return generateGradientFromColor(serverColor)
  }

  // Fallback to default gradient
  return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
}

// Helper function to generate gradient from hex color
const generateGradientFromColor = (hexColor) => {
  // Convert hex to inline style gradient
  return {
    background: `linear-gradient(to bottom right, ${hexColor}DD, ${hexColor}AA, ${hexColor}77)`
  }
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

export const getCaseBadgeColor = (caseId, serverColor = null) => {
  // If server provided a color, generate badge colors from it
  if (serverColor) {
    return generateBadgeFromColor(serverColor)
  }
  
  // Fallback to hardcoded colors
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

// Helper function to generate badge colors from hex color
const generateBadgeFromColor = (hexColor) => {
  return {
    backgroundColor: `${hexColor}33`, // 20% opacity
    color: `${hexColor}DD`, // 87% opacity for text
    borderColor: `${hexColor}80`, // 50% opacity for border
    border: `1px solid ${hexColor}80`
  }
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
