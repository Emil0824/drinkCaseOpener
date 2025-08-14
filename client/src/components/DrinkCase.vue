<template>
  <div class="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-white mb-2">Open a Drink Case</h2>
      <p class="text-gray-300">Click the case to open it and discover your drink!</p>
    </div>

    <!-- Case Selection -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold text-white mb-4">Select Case Type</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          v-for="caseType in caseTypes"
          :key="caseType.id"
          @click="selectedCaseType = caseType.id"
          class="p-4 rounded-lg border-2 transition-all duration-200"
          :class="selectedCaseType === caseType.id 
            ? 'border-purple-500 bg-purple-500/20 text-white' 
            : 'border-white/20 bg-white/5 text-gray-300 hover:border-purple-300 hover:bg-purple-300/10'"
        >
          <div class="font-semibold">{{ caseType.name }}</div>
          <div class="text-sm opacity-80">{{ caseType.description }}</div>
        </button>
      </div>
    </div>

    <!-- Case Opening Area -->
    <div class="text-center">
      <!-- Case Box -->
      <div class="mb-8">
        <div 
          class="relative mx-auto w-64 h-64 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl cursor-pointer transform transition-all duration-200 hover:scale-105"
          :class="{ 'animate-pulse': isOpening }"
          @click="openCase"
        >
          <div class="absolute inset-4 border-4 border-white/30 rounded-xl"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-6xl">📦</div>
          </div>
          
          <!-- Opening animation overlay -->
          <div 
            v-if="isOpening" 
            class="absolute inset-0 bg-white/20 rounded-2xl flex items-center justify-center"
          >
            <div class="text-white text-xl font-bold">Opening...</div>
          </div>
        </div>
      </div>

      <!-- Open Case Button -->
      <button
        @click="openCase"
        :disabled="isOpening"
        class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 transform hover:scale-105"
      >
        {{ isOpening ? 'Opening...' : 'Open Case' }}
      </button>
    </div>

    <!-- Result Display -->
    <div v-if="lastOpenedDrink" class="mt-12 p-6 bg-white/10 rounded-xl border border-white/20">
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
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const selectedCaseType = ref('all')
const isOpening = ref(false)
const lastOpenedDrink = ref(null)
const error = ref(null)
const caseTypes = ref([])

// Fetch available case types on component mount
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/cases/types')
    const data = await response.json()
    if (data.success) {
      caseTypes.value = data.data
    }
  } catch (err) {
    console.error('Failed to fetch case types:', err)
    // Fallback case types
    caseTypes.value = [
      { id: 'all', name: 'Mixed Case', description: 'Contains all types of drinks' },
      { id: 'cocktail', name: 'Cocktail Case', description: 'Contains only cocktails' },
      { id: 'mocktail', name: 'Mocktail Case', description: 'Contains only mocktails' }
    ]
  }
})

const openCase = async () => {
  if (isOpening.value) return
  
  isOpening.value = true
  error.value = null
  
  try {
    // Simulate opening animation delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const response = await fetch('http://localhost:3000/api/cases/open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caseType: selectedCaseType.value
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      lastOpenedDrink.value = data.data.winningDrink
    } else {
      error.value = data.message || 'Failed to open case'
    }
  } catch (err) {
    console.error('Error opening case:', err)
    error.value = 'Failed to connect to server. Make sure it is running.'
  } finally {
    isOpening.value = false
  }
}

const getRarityColor = (rarity) => {
  const colors = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    legendary: 'text-purple-400'
  }
  return colors[rarity] || 'text-white'
}
</script>
