<template>
  <nav class="bg-black/20 backdrop-blur-sm border-b border-white/10">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">🍹</span>
          </div>
          <span class="text-xl font-bold text-white">Drink Case Opener</span>
        </div>
        
        <div class="hidden md:flex space-x-6">
          <a href="#" class="text-white hover:text-purple-300 transition-colors">Home</a>
          <a href="#" class="text-white hover:text-purple-300 transition-colors">Cases</a>
          <a href="#" class="text-white hover:text-purple-300 transition-colors">About</a>
        </div>
        
        <button class="md:hidden text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
// Navigation component for the drink case website
</script>
