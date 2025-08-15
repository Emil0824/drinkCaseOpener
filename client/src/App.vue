<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <Navbar />
    
    <main class="container mx-auto px-4 py-8">
      <!-- Hero Section -->
      <section class="text-center mb-12">
        <h1 class="text-5xl font-bold text-white mb-4">
          Drink Case Opener
        </h1>
        <p class="text-xl text-gray-300 mb-8">
          Open cases and discover amazing cocktails and drinks!
        </p>
      </section>

      <!-- Router Content -->
      <section class="max-w-4xl mx-auto">
        <router-view />
      </section>

      <!-- Development Tools (only visible in dev mode) -->
      <section v-if="isDevelopment" class="mt-12 text-center">
        <button 
          @click="checkServerHealth" 
          class="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
          :disabled="isChecking"
        >
          {{ isChecking ? 'Checking...' : 'Test Server Connection' }}
        </button>
        
        <div 
          v-if="serverStatus" 
          class="mt-4 p-4 rounded-lg transition-colors"
          :class="serverStatus.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'"
        >
          {{ serverStatus.message }}
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Navbar from './components/Navbar.vue'

// Reactive state
const isChecking = ref(false)
const serverStatus = ref(null)

// Computed properties
const isDevelopment = computed(() => import.meta.env.DEV)

// Methods
const checkServerHealth = async () => {
  isChecking.value = true
  serverStatus.value = null
  
  try {
    const response = await fetch('http://localhost:3000/api/health')
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    serverStatus.value = {
      success: true,
      message: 'Server is running and accessible!'
    }
  } catch (error) {
    console.error('Server health check failed:', error)
    serverStatus.value = {
      success: false,
      message: `Cannot connect to server: ${error.message}`
    }
  } finally {
    isChecking.value = false
  }
}
</script>