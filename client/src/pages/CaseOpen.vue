<template>
  <div class="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
    <!-- Back Button -->
    <div class="mb-6">
      <button @click="goBack"
        class="flex items-center text-gray-300 hover:text-white transition-colors duration-200 group">
        <svg class="w-5 h-5 mr-2 transform transition-transform group-hover:-translate-x-1" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Cases
      </button>
    </div>

    <!-- Page Header -->
    <header class="text-center mb-8">
      <h2 class="text-3xl font-bold text-white mb-2">
        {{ caseTitle }}
      </h2>
      <p class="text-gray-300">Click the case to open it and discover your drink!</p>
    </header>

    <!-- Case Opening Area -->
    <div class="text-center">
      <!-- Case Box -->
      <div class="mb-8" v-show="!showSpinner">
        <div
          class="relative mx-auto w-64 h-64 rounded-2xl shadow-2xl cursor-pointer transform transition-all duration-200 hover:scale-105"
          :class="!caseData?.color ? getCaseGradient(props.caseType) : ''"
          :style="caseData?.color ? getCaseGradient(props.caseType, caseData.color) : {}"
          @click="openCase">
          <div class="absolute inset-4 border-4 border-white/30 rounded-xl"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-6xl">{{ caseData?.icon }}</div>
          </div>
        </div>
      </div>

      <!-- Case Spinner Component -->
      <div v-show="showSpinner" class="mb-8">
        <CaseSpinner ref="caseSpinner" :items="spinnerItems" :winning-item="winningDrink" :is-spinning="isSpinning"
          :should-slow-down="shouldSlowDown" :item-width="120" :item-gap="12" :visible-items="7" :animation-duration="7"
          :spin-speed="1" :show-debug="false" @spin-complete="onSpinComplete" />
      </div>

      <!-- Open Case Button -->
      <div class="flex justify-center">
        <button @click="openCase" :disabled="isActionDisabled"
          class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
          v-show="!showSpinner || (!isSpinning && spinCompleted)">
          <!-- Animation Icons -->
          <div v-if="isOpening"
            class="w-5 h-5 border-2 border-white/30 border-t-white border-r-white rounded-full animate-spin"></div>
          <div v-else-if="isSpinning" class="flex space-x-1">
            <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          {{ buttonText }}
        </button>
      </div>
    </div>

    <!-- Result Display -->
    <div v-if="lastOpenedDrink && spinCompleted" class="mt-12 p-6 bg-white/10 rounded-xl border border-white/20">
      <h3 class="text-2xl font-bold text-center mb-4" :class="getRatingColor(lastOpenedDrink.rating)">
        {{ lastOpenedDrink.name }}
      </h3>

      <div class="grid lg:grid-cols-2 gap-8">
        <div class="flex justify-center items-start">
          <div class="w-full max-w-md">
            <div class="aspect-square overflow-hidden rounded-lg bg-white/5">
              <img :src="lastOpenedDrink.image" :alt="lastOpenedDrink.name" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div class="text-left space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-gray-400 block text-sm">Rating:</span>
              <span class="font-semibold text-lg" :class="getRatingColor(lastOpenedDrink.rating)">
                {{ lastOpenedDrink.rating ? `${lastOpenedDrink.rating}/5 ⭐` : 'Not rated' }}
              </span>
            </div>

            <div>
              <span class="text-gray-400 block text-sm">Prep Time:</span>
              <span class="text-white text-lg font-medium">{{ lastOpenedDrink.prepTime }} min</span>
            </div>

            <div class="col-span-2">
              <span class="text-gray-400 block text-sm">Recipe URL:</span>
              <a :href="lastOpenedDrink.url" target="_blank" rel="noopener noreferrer"
                class="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-lg underline">
                View Full Recipe
              </a>
            </div>
          </div>

          <div class="grid lg:grid-cols-2 gap-6">
            <div>
              <div class="text-gray-400 mb-3 text-sm">Ingredients:</div>
              <ul class="space-y-2">
                <li v-for="ingredient in getIngredients(lastOpenedDrink.ingredients)" :key="ingredient"
                  class="text-white flex items-center">
                  <span class="w-2 h-2 bg-white/60 rounded-full mr-3"></span>
                  {{ ingredient }}
                </li>
              </ul>
            </div>
            
            <div v-if="getTips(lastOpenedDrink.ingredients).length > 0">
              <div class="text-gray-400 mb-3 text-sm">Tips:</div>
              <ul class="space-y-2">
                <li v-for="tip in getTips(lastOpenedDrink.ingredients)" :key="tip"
                  class="text-white flex items-center">
                  <span class="w-2 h-2 bg-amber-400/60 rounded-full mr-3"></span>
                  {{ tip }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CaseSpinner from '../components/CaseSpinner.vue'
import {
  getCaseTitle,
  getCaseGradient,
  getCaseIcon,
  getRatingColor,
  createApiRequest,
  isValidCaseType
} from '../utils/caseHelpers.js'

// Router and props
const router = useRouter()
const props = defineProps({
  caseType: {
    type: String,
    required: true,
    validator: isValidCaseType
  }
})

// Reactive state
const isOpening = ref(false)
const isSpinning = ref(false)
const showSpinner = ref(false)
const spinCompleted = ref(false)
const lastOpenedDrink = ref(null)
const winningDrink = ref(null)
const spinnerItems = ref([])
const error = ref(null)
const caseSpinner = ref(null)
const shouldSlowDown = ref(false)
const caseData = ref(null)

// Computed properties
const caseTitle = computed(() => getCaseTitle(props.caseType))

const buttonText = computed(() => {
  if (isOpening.value && !shouldSlowDown.value) return 'Getting your drink...'
  if (isSpinning.value && shouldSlowDown.value) return 'Slowing down...'
  if (isSpinning.value) return 'Spinning...'
  if (spinCompleted.value) return `Open Another ${caseTitle.value}`
  return 'Open Case'
})

const isActionDisabled = computed(() => {
  return isOpening.value || isSpinning.value
})

// Navigation methods
const goBack = () => {
  router.push('/')
}

// State management
const resetCase = () => {
  // Reset all state
  Object.assign({
    lastOpenedDrink: null,
    winningDrink: null,
    spinnerItems: [],
    error: null,
    showSpinner: false,
    isSpinning: false,
    spinCompleted: false,
    shouldSlowDown: false
  }, {
    lastOpenedDrink: lastOpenedDrink.value = null,
    winningDrink: winningDrink.value = null,
    spinnerItems: spinnerItems.value = [],
    error: error.value = null,
    showSpinner: showSpinner.value = false,
    isSpinning: isSpinning.value = false,
    spinCompleted: spinCompleted.value = false,
    shouldSlowDown: shouldSlowDown.value = false
  })

  // Reset spinner component
  caseSpinner.value?.reset()
}

// API methods
const loadCaseData = async () => {
  try {
    const cases = await createApiRequest('/cases/cases')
    caseData.value = cases.find(c => c.id === props.caseType)
  } catch (err) {
    console.warn('Could not load case data:', err.message)
    // Not critical error, component can still function without icons
  }
}

const openCase = async () => {
  if (isActionDisabled.value) return

  // Initialize opening state
  showSpinner.value = true
  isSpinning.value = true
  isOpening.value = true
  error.value = null
  shouldSlowDown.value = false

  // Reset and start spinner
  caseSpinner.value?.reset()
  setTimeout(() => caseSpinner.value?.startConstantSpin(), 100)

  try {
    const data = await createApiRequest('/cases/open', {
      method: 'POST',
      body: JSON.stringify({ caseType: props.caseType })
    })

    winningDrink.value = data.winningDrink
    spinnerItems.value = data.animationItems || []

    // Delay before slowing down for better UX
    setTimeout(() => {
      isOpening.value = false
      shouldSlowDown.value = true
    }, 1000)
  } catch (err) {
    console.error('Error opening case:', err)
    error.value = `Failed to open case: ${err.message}`
    resetSpinningState()
  }
}

const resetSpinningState = () => {
  isOpening.value = false
  isSpinning.value = false
  showSpinner.value = false
}

// Event handlers
const onSpinComplete = (winningItem) => {
  isSpinning.value = false
  spinCompleted.value = true
  lastOpenedDrink.value = winningItem
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const getIngredients = (ingredients) => {
  if (!ingredients) return []
  return ingredients.filter(ingredient => /^\d/.test(ingredient.trim()))
}

const getTips = (ingredients) => {
  if (!ingredients) return []
  return ingredients.filter(ingredient => !/^\d/.test(ingredient.trim()))
}

// Note: Utility functions are now imported from caseHelpers.js

// Lifecycle
onMounted(() => {
  loadCaseData()
})
</script>
