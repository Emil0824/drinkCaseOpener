<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <Navbar />
    
    <main class="container mx-auto px-4 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-white mb-4">
          Drink Case Opener
        </h1>
        <p class="text-xl text-gray-300 mb-8">
          Open cases and discover amazing cocktails and drinks!
        </p>
      </div>

      <!-- Case Opening Section -->
      <div class="max-w-4xl mx-auto">
        <DrinkCase />
      </div>

      <!-- Health Check -->
      <div class="mt-12 text-center">
        <button 
          @click="checkServerHealth" 
          class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          :disabled="isChecking"
        >
          {{ isChecking ? 'Checking...' : 'Test Server Connection' }}
        </button>
        
        <div v-if="serverStatus" class="mt-4 p-4 rounded-lg" :class="serverStatus.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'">
          {{ serverStatus.message }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import DrinkCase from './components/DrinkCase.vue'

const isChecking = ref(false)
const serverStatus = ref(null)

const checkServerHealth = async () => {
  isChecking.value = true
  serverStatus.value = null
  
  try {
    const response = await fetch('http://localhost:3000/api/health')
    const data = await response.json()
    serverStatus.value = {
      success: true,
      message: 'Server is running and accessible!'
    }
  } catch (error) {
    serverStatus.value = {
      success: false,
      message: 'Cannot connect to server. Make sure it is running on port 3000.'
    }
  } finally {
    isChecking.value = false
  }
}
</script>