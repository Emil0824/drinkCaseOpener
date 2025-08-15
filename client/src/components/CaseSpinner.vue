<template>
  <div class="case-spinner-container">
    <!-- Roulette Container -->
    <div class="roulette-container">
      <!-- Needle/Pointer -->
      <div class="needle"></div>
      
      <!-- Items Track -->
      <div 
        ref="itemsTrack" 
        class="items-track"
        :style="{ width: totalWidth + 'px' }"
      >
        <div 
          v-for="(item, index) in displayItems" 
          :key="`${item.id}-${index}`"
          class="item-slot"
          :class="getRarityClass(item.rarity)"
        >
          <div class="item-content">
            <div class="drink-emoji">{{ getDrinkEmoji(item.type, item.name) }}</div>
            <div class="item-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Animation Status (for debugging - can be removed) -->
    <div v-if="showDebug" class="debug-info">
      <p>Animation Status: {{ animationStatus }}</p>
      <p>Items Count: {{ displayItems.length }}</p>
      <p>Winning Index: {{ winningIndex }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { gsap } from 'gsap'

// Props with validation
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
    validator: (items) => Array.isArray(items)
  },
  winningItem: {
    type: Object,
    default: null,
    validator: (item) => item === null || (typeof item === 'object' && item.id)
  },
  isSpinning: {
    type: Boolean,
    default: false
  },
  shouldSlowDown: {
    type: Boolean,
    default: false
  },
  // Animation configuration
  itemWidth: {
    type: Number,
    default: 100,
    validator: (value) => value > 0
  },
  itemGap: {
    type: Number,
    default: 12,
    validator: (value) => value >= 0
  },
  visibleItems: {
    type: Number,
    default: 7,
    validator: (value) => value > 0
  },
  animationDuration: {
    type: Number,
    default: 4,
    validator: (value) => value > 0
  },
  spinSpeed: {
    type: Number,
    default: 5,
    validator: (value) => value > 0
  },
  showDebug: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['spin-complete'])

// Refs
const itemsTrack = ref(null)
const animationStatus = ref('idle')
const displayItems = ref([])
const winningIndex = ref(-1)
const constantSpinAnimation = ref(null)

// Computed
const itemSlotWidth = computed(() => props.itemWidth + props.itemGap)
const totalWidth = computed(() => displayItems.value.length * itemSlotWidth.value)
const containerWidth = computed(() => props.visibleItems * itemSlotWidth.value)

// Item setup methods
const createPlaceholderItems = (count = 40) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `placeholder-${index}`,
    name: '???',
    type: 'mystery',
    rarity: 'common'
  }))
}

const setupItems = () => {
  // Create placeholder items for initial spinning
  if (displayItems.value.length === 0) {
    displayItems.value = createPlaceholderItems()
  }
  
  // If we have real items and winning item, update the display
  if (props.items.length > 0 && props.winningItem) {
    const itemCopies = 4 // Number of times to repeat the items list
    const extendedItems = []
    
    for (let i = 0; i < itemCopies; i++) {
      extendedItems.push(...props.items)
    }
    
    // Place the winning item at a strategic position for the animation to land on
    const centerPosition = Math.floor(extendedItems.length * 0.7) // 70% through the list
    winningIndex.value = centerPosition
    extendedItems[centerPosition] = { ...props.winningItem }
    
    displayItems.value = extendedItems
  }
}

const startConstantSpin = () => {
  if (!itemsTrack.value) return
  
  killAllAnimations()
  
  animationStatus.value = 'spinning'
  
  // Reset position
  gsap.set(itemsTrack.value, { x: 0 })
  
  // Start constant infinite spinning animation
  constantSpinAnimation.value = gsap.to(itemsTrack.value, {
    x: -totalWidth.value,
    duration: 5, // Speed of constant spinning
    ease: "none",
    repeat: -1,
    modifiers: {
      x: (x) => {
        // Keep the animation within bounds for seamless looping
        const parsedX = parseFloat(x)
        const loopWidth = totalWidth.value / 4 // Since we have 4 copies
        return (parsedX % loopWidth) + "px"
      }
    }
  })
}

const slowDownToWin = () => {
  if (!itemsTrack.value || !props.winningItem || winningIndex.value === -1) return
  
  // Kill the constant spinning animation
  if (constantSpinAnimation.value) {
    constantSpinAnimation.value.kill()
  }
  
  // Calculate precise final position to center the winning item under the needle
  const containerCenter = containerWidth.value / 2
  const itemCenter = itemSlotWidth.value / 2
  const winningItemPosition = winningIndex.value * itemSlotWidth.value + itemCenter
  const finalX = containerCenter - winningItemPosition
  
  // Get current position and normalize it
  const currentX = parseFloat(gsap.getProperty(itemsTrack.value, "x"))
  
  // Calculate how many full loops we need to add to reach the winning position
  // We want to add at least 2-3 full container widths for dramatic effect
  const extraSpins = containerWidth.value * 3
  
  // Find the target position that's furthest from current but lands on winner
  let targetX = finalX
  
  // Keep moving the target further to the left until we have enough spinning distance
  while (targetX > currentX - extraSpins) {
    targetX -= containerWidth.value
  }
  
  // Create the slowing down animation
  const timeline = gsap.timeline({
    onComplete: () => {
      animationStatus.value = 'complete'
      emit('spin-complete', props.winningItem)
    }
  })
  
  // Animate from current position to final position with realistic easing
  timeline.to(itemsTrack.value, {
    x: targetX,
    duration: props.animationDuration,
    ease: "power3.out"
  })
  
  return timeline
}

const startSpin = async () => {
  // This method is kept for backward compatibility
  // But now it just starts the constant spinning
  startConstantSpin()
}

// Animation control methods
const killAllAnimations = () => {
  if (constantSpinAnimation.value) {
    constantSpinAnimation.value.kill()
    constantSpinAnimation.value = null
  }
  
  if (itemsTrack.value) {
    gsap.killTweensOf(itemsTrack.value)
    gsap.set(itemsTrack.value, { x: 0 })
  }
}

const reset = () => {
  animationStatus.value = 'idle'
  winningIndex.value = -1
  
  killAllAnimations()
  
  // Reset to placeholder items
  displayItems.value = createPlaceholderItems()
}

const getRarityClass = (rarity) => {
  const rarityClasses = {
    common: 'rarity-common',
    uncommon: 'rarity-uncommon', 
    rare: 'rarity-rare',
    legendary: 'rarity-legendary'
  }
  return rarityClasses[rarity] || 'rarity-common'
}

// Emoji mapping constants
const DRINK_EMOJIS = {
  'mojito': '🌿',
  'margarita': '🍹',
  'cosmopolitan': '💗',
  'old fashioned': '🥃',
  'whiskey sour': '🍋',
  'pina colada': '🥥',
  'virgin mojito': '🌿',
  'shirley temple': '🍒'
}

const TYPE_EMOJIS = {
  cocktail: '🍸',
  mocktail: '🧃',
  beer: '🍺',
  wine: '🍷',
  coffee: '☕',
  tea: '🍵',
  juice: '🧋',
  mystery: '❓'
}

// Utility functions
const getDrinkEmoji = (type, name) => {
  // Handle mystery/placeholder items
  if (type === 'mystery' && name === '???') {
    return TYPE_EMOJIS.mystery
  }
  
  // Try specific drink name first
  const lowerName = name.toLowerCase()
  if (DRINK_EMOJIS[lowerName]) {
    return DRINK_EMOJIS[lowerName]
  }
  
  // Fallback to type-based emojis
  return TYPE_EMOJIS[type] || '🍹'
}

// Watch for prop changes
watch(() => props.isSpinning, (newValue) => {
  if (newValue && animationStatus.value === 'idle') {
    startConstantSpin()
  }
})

watch(() => props.shouldSlowDown, (newValue) => {
  if (newValue && animationStatus.value === 'spinning' && props.winningItem) {
    slowDownToWin()
  }
})

watch(() => [props.items, props.winningItem], () => {
  setupItems()
}, { immediate: true, deep: true })

// Expose methods for parent component
defineExpose({
  startSpin,
  startConstantSpin,
  slowDownToWin,
  reset,
  animationStatus: computed(() => animationStatus.value)
})

onMounted(() => {
  setupItems()
})
</script>

<style scoped>
.case-spinner-container {
  width: 100%;
  max-width: 56rem;
  margin: 0 auto;
}

.roulette-container {
  position: relative;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(17, 24, 39, 0.9));
  backdrop-filter: blur(15px);
  border-radius: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  height: 180px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.needle {
  position: absolute;
  top: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgb(239, 68, 68), rgb(220, 38, 38));
  z-index: 20;
  width: 4px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 
    0 0 15px rgba(239, 68, 68, 0.8),
    0 0 30px rgba(239, 68, 68, 0.4),
    inset 0 0 5px rgba(255, 255, 255, 0.3);
  animation: needle-pulse 1s ease-in-out infinite alternate;
}

@keyframes needle-pulse {
  from {
    box-shadow: 
      0 0 15px rgba(239, 68, 68, 0.8),
      0 0 30px rgba(239, 68, 68, 0.4),
      inset 0 0 5px rgba(255, 255, 255, 0.3);
  }
  to {
    box-shadow: 
      0 0 20px rgba(239, 68, 68, 1),
      0 0 40px rgba(239, 68, 68, 0.6),
      inset 0 0 8px rgba(255, 255, 255, 0.5);
  }
}

.needle::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 20px solid rgb(239, 68, 68);
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.8));
}

.needle::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 20px solid rgb(239, 68, 68);
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.8));
}

.items-track {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  will-change: transform;
}

.item-slot {
  flex-shrink: 0;
  height: 100%;
  position: relative;
  overflow: hidden;
  width: v-bind('itemSlotWidth + "px"');
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-content {
  width: 100%;
  height: 100%;
  max-width: 90px;
  max-height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  border: 2px solid;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  overflow: hidden;
}

.item-slot:hover .item-content {
  transform: scale(1.05) translateY(-2px);
}

.drink-emoji {
  font-size: 2.5rem;
  margin-bottom: 0.375rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

.item-name {
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  line-height: 1.1;
  text-align: center;
  max-width: 100%;
}

/* Rarity Colors with beautiful glowing borders */
.rarity-common .item-content {
  background: linear-gradient(135deg, 
    rgba(107, 114, 128, 0.3), 
    rgba(75, 85, 99, 0.5)
  );
  border-color: rgba(156, 163, 175, 0.6);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(156, 163, 175, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.rarity-uncommon .item-content {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.3), 
    rgba(21, 128, 61, 0.5)
  );
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.4),
    0 0 25px rgba(34, 197, 94, 0.4),
    0 0 35px rgba(34, 197, 94, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.rarity-rare .item-content {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.3), 
    rgba(29, 78, 216, 0.5)
  );
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(59, 130, 246, 0.5),
    0 0 45px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.rarity-legendary .item-content {
  background: linear-gradient(135deg, 
    rgba(147, 51, 234, 0.4), 
    rgba(126, 34, 206, 0.6)
  );
  border-color: rgba(147, 51, 234, 0.9);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 0 35px rgba(147, 51, 234, 0.6),
    0 0 50px rgba(147, 51, 234, 0.4),
    0 0 65px rgba(147, 51, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: legendary-glow 2s ease-in-out infinite alternate;
}

@keyframes legendary-glow {
  from {
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.5),
      0 0 35px rgba(147, 51, 234, 0.6),
      0 0 50px rgba(147, 51, 234, 0.4),
      0 0 65px rgba(147, 51, 234, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  to {
    box-shadow: 
      0 4px 25px rgba(0, 0, 0, 0.6),
      0 0 45px rgba(147, 51, 234, 0.8),
      0 0 65px rgba(147, 51, 234, 0.6),
      0 0 85px rgba(147, 51, 234, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
}

/* Add subtle floating animation to legendary items */
.rarity-legendary .item-content {
  animation: legendary-glow 2s ease-in-out infinite alternate, 
             legendary-float 3s ease-in-out infinite;
}

@keyframes legendary-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Sparkle effects for legendary items */
.rarity-legendary .drink-emoji::after {
  content: '✨';
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  font-size: 0.75rem;
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.6;
    transform: scale(0.8) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
}

.debug-info {
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.375rem;
  color: white;
  font-size: 0.875rem;
}

/* Enhanced glow effect for the winning item area */
.roulette-container::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  background: linear-gradient(to right, 
    transparent, 
    rgba(255, 255, 255, 0.05), 
    rgba(255, 255, 255, 0.12), 
    rgba(255, 255, 255, 0.05), 
    transparent
  );
  z-index: 5;
  pointer-events: none;
  width: v-bind('itemSlotWidth + "px"');
  left: 50%;
  transform: translateX(-50%);
  animation: winning-area-glow 2s ease-in-out infinite alternate;
}

@keyframes winning-area-glow {
  from {
    background: linear-gradient(to right, 
      transparent, 
      rgba(255, 255, 255, 0.05), 
      rgba(255, 255, 255, 0.12), 
      rgba(255, 255, 255, 0.05), 
      transparent
    );
  }
  to {
    background: linear-gradient(to right, 
      transparent, 
      rgba(255, 255, 255, 0.08), 
      rgba(255, 255, 255, 0.18), 
      rgba(255, 255, 255, 0.08), 
      transparent
    );
  }
}
</style>