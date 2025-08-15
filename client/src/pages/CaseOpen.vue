<template>
  <div class="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
    <!-- Back Button -->
    <div class="mb-6">
      <button 
        @click="goBack"
        class="flex items-center text-gray-300 hover:text-white transition-colors duration-200 group"
      >
        <svg class="w-5 h-5 mr-2 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          :class="[getCaseGradient(caseType)]"
          @click="openCase"
        >
          <div class="absolute inset-4 border-4 border-white/30 rounded-xl"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-6xl">{{ getCaseIcon(caseType) }}</div>
          </div>
        </div>
      </div>

      <!-- Case Spinner Component -->
      <div v-show="showSpinner" class="mb-8">
        <CaseSpinner
          ref="caseSpinner"
          :items="spinnerItems"
          :winning-item="winningDrink"
          :is-spinning="isSpinning"
          :should-slow-down="shouldSlowDown"
          :item-width="100"
          :item-gap="12"
          :visible-items="7"
          :animation-duration="7"
          :spin-speed="1"
          :show-debug="false"
          @spin-complete="onSpinComplete"
        />
      </div>

      <!-- Open Case Button -->
      <button
        @click="openCase"
        :disabled="isActionDisabled"
        class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
        v-show="!showSpinner || (!isSpinning && spinCompleted)"
      >
        <!-- Animation Icons -->
        <div v-if="isOpening" class="w-5 h-5 border-2 border-white/30 border-t-white border-r-white rounded-full animate-spin"></div>
        <div v-else-if="isSpinning" class="flex space-x-1">
          <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0s"></div>
          <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        {{ buttonText }}
      </button>
    </div>

    <!-- Result Display -->
    <div v-if="lastOpenedDrink && spinCompleted" class="mt-12 p-6 bg-white/10 rounded-xl border border-white/20">
      <h3 class="text-2xl font-bold text-center mb-4" :class="getRarityColor(lastOpenedDrink.rarity)">
        {{ lastOpenedDrink.name }}
      </h3>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <img 
            :src="lastOpenedDrink.image" 
            :alt="lastOpenedDrink.name"
            class="w-full h-48 object-cover rounded-lg"
          />
        </div>
        
        <div class="text-left">
          <div class="mb-3">
            <span class="text-gray-400">Type:</span>
            <span class="text-white ml-2 capitalize">{{ lastOpenedDrink.type }}</span>
          </div>
          
          <div class="mb-3">
            <span class="text-gray-400">Rarity:</span>
            <span class="ml-2 capitalize font-semibold" :class="getRarityColor(lastOpenedDrink.rarity)">
              {{ lastOpenedDrink.rarity }}
            </span>
          </div>
          
          <div class="mb-3">
            <span class="text-gray-400">Alcohol:</span>
            <span class="text-white ml-2">{{ lastOpenedDrink.alcoholContent }}</span>
          </div>
          
          <div class="mb-4">
            <div class="text-gray-400 mb-2">Ingredients:</div>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="ingredient in lastOpenedDrink.ingredients" 
                :key="ingredient"
                class="bg-white/20 text-white px-3 py-1 rounded-full text-sm"
              >
                {{ ingredient }}
              </span>
            </div>
          </div>
          
          <p class="text-gray-300 text-sm">{{ lastOpenedDrink.description }}</p>
        </div>
      </div>

      <!-- Open Another Button -->
      <div class="text-center mt-6">
        <button
          @click="resetCase"
          class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          Open Another {{ caseTitle }}
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import CaseSpinner from '../components/CaseSpinner.vue'
import { 
  getCaseTitle,
  getCaseGradient,
  getCaseIcon,
  getRarityColor,
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

// Note: Utility functions are now imported from caseHelpers.js
</script>
