<template>
  <div class="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
    <!-- Page Header -->
    <header class="text-center mb-12">
      <h2 class="text-4xl font-bold text-white mb-4">Choose Your Case</h2>
      <p class="text-xl text-gray-300">Select a case to open and discover amazing drinks!</p>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-16">
      <div class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-white text-lg">Loading cases...</p>
    </div>

    <!-- Case Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <article
        v-for="caseType in caseTypes"
        :key="caseType.id"
        @click="selectCase(caseType)"
        @keydown.enter="selectCase(caseType)"
        @keydown.space.prevent="selectCase(caseType)"
        class="group cursor-pointer transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 rounded-2xl"
        tabindex="0"
        :aria-label="`Open ${caseType.name}`"
      >
        <div class="relative">
          <!-- Case Box -->
          <div 
            class="relative w-full aspect-square rounded-2xl shadow-2xl transition-all duration-300 group-hover:shadow-3xl group-focus:shadow-3xl"
            :class="getCaseGradient(caseType.id)"
          >
            <!-- Inner border -->
            <div class="absolute inset-4 border-4 border-white/30 rounded-xl"></div>
            
            <!-- Case icon -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-6xl transform transition-transform duration-300 group-hover:scale-110 group-focus:scale-110">
                {{ getCaseIcon(caseType.id) }}
              </div>
            </div>
            
            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 group-focus:bg-white/10 rounded-2xl transition-all duration-300 flex items-center justify-center">
              <div class="text-white text-lg font-bold opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
                Click to Open!
              </div>
            </div>
          </div>
          
          <!-- Case Information -->
          <div class="mt-6 text-center">
            <h3 class="text-2xl font-bold text-white mb-2">{{ caseType.name }}</h3>
            <p class="text-gray-300 text-sm leading-relaxed mb-4">{{ caseType.description }}</p>
            
            <!-- Case Badge -->
            <span 
              class="inline-block px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              :class="getCaseBadgeColor(caseType.id)"
            >
              {{ caseType.name }}
            </span>
          </div>
        </div>
      </article>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mt-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-center">
      <p class="font-semibold mb-2">⚠️ {{ error }}</p>
      <button 
        @click="fetchCaseTypes"
        class="text-red-300 hover:text-red-100 underline transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getCaseGradient,
  getCaseIcon,
  getCaseBadgeColor,
  createApiRequest
} from '../utils/caseHelpers.js'

// Router instance
const router = useRouter()

// Reactive state
const caseTypes = ref([])
const isLoading = ref(true)
const error = ref(null)

// Methods
const fetchCaseTypes = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const data = await createApiRequest('/cases/cases')
    
    if (Array.isArray(data)) {
      caseTypes.value = data
    } else {
      throw new Error('Invalid response format')
    }
  } catch (err) {
    console.error('Failed to fetch case types:', err)
    error.value = 'Using offline mode - server not available'
  } finally {
    isLoading.value = false
  }
}

const selectCase = (caseType) => {
  if (!caseType?.id) return
  router.push(`/case/${caseType.id}`)
}

// Lifecycle
onMounted(fetchCaseTypes)
</script>
