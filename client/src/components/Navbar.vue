<template>
  <nav class="bg-black/20 backdrop-blur-sm border-b border-white/10">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Brand Logo -->
        <router-link 
          to="/" 
          class="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          aria-label="Go to homepage"
        >
          <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg" role="img" aria-label="Cocktail">🍹</span>
          </div>
          <span class="text-xl font-bold text-white">Drink Case Opener</span>
        </router-link>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-6" role="navigation">
          <router-link 
            to="/" 
            class="text-white hover:text-purple-300 transition-colors font-medium"
            :class="{ 'text-purple-300': $route.path === '/' }"
          >
            Home
          </router-link>
          <!-- Future navigation items -->
          <span class="text-gray-500 cursor-not-allowed" title="Coming soon">Cases</span>
          <span class="text-gray-500 cursor-not-allowed" title="Coming soon">About</span>
        </nav>
        
        <!-- Mobile Menu Button (for future mobile menu implementation) -->
        <button 
          class="md:hidden text-white hover:opacity-80 transition-opacity" 
          aria-label="Toggle mobile menu"
          @click="toggleMobileMenu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

// Get current route for active link styling
const $route = useRoute()

// Methods
const toggleMobileMenu = () => {
  // TODO: Implement mobile menu functionality
  console.log('Mobile menu toggle - to be implemented')
}
</script>
