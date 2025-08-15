/**
 * Utility functions for case-related operations
 */

// Case configuration constants
export const CASE_TYPES = {
  ALL: 'all',
  COCKTAIL: 'cocktail',
  MOCKTAIL: 'mocktail'
}

export const RARITY_LEVELS = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  LEGENDARY: 'legendary'
}

// Case styling utilities
export const getCaseGradient = (caseId) => {
  const gradients = {
    [CASE_TYPES.ALL]: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
    [CASE_TYPES.COCKTAIL]: 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500',
    [CASE_TYPES.MOCKTAIL]: 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-500'
  }
  return gradients[caseId] || gradients[CASE_TYPES.ALL]
}

export const getCaseIcon = (caseId) => {
  const icons = {
    [CASE_TYPES.ALL]: '🎲',
    [CASE_TYPES.COCKTAIL]: '🍸',
    [CASE_TYPES.MOCKTAIL]: '🧃'
  }
  return icons[caseId] || '📦'
}

export const getCaseTitle = (caseId) => {
  const titles = {
    [CASE_TYPES.ALL]: 'Mixed Case',
    [CASE_TYPES.COCKTAIL]: 'Cocktail Case',
    [CASE_TYPES.MOCKTAIL]: 'Mocktail Case'
  }
  return titles[caseId] || 'Drink Case'
}

export const getCaseBadgeColor = (caseId) => {
  const colors = {
    [CASE_TYPES.ALL]: 'bg-orange-500/20 text-orange-200 border border-orange-500/50',
    [CASE_TYPES.COCKTAIL]: 'bg-purple-500/20 text-purple-200 border border-purple-500/50',
    [CASE_TYPES.MOCKTAIL]: 'bg-green-500/20 text-green-200 border border-green-500/50'
  }
  return colors[caseId] || colors[CASE_TYPES.ALL]
}

// Rarity styling utilities
export const getRarityColor = (rarity) => {
  const colors = {
    [RARITY_LEVELS.COMMON]: 'text-gray-400',
    [RARITY_LEVELS.UNCOMMON]: 'text-green-400',
    [RARITY_LEVELS.RARE]: 'text-blue-400',
    [RARITY_LEVELS.LEGENDARY]: 'text-purple-400'
  }
  return colors[rarity] || 'text-white'
}

// API utilities
export const createApiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

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
}

// Validation utilities
export const isValidCaseType = (caseType) => {
  return Object.values(CASE_TYPES).includes(caseType)
}

export const isValidRarity = (rarity) => {
  return Object.values(RARITY_LEVELS).includes(rarity)
}
