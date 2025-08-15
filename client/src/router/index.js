/**
 * Vue Router Configuration
 * Defines application routes and navigation structure
 */

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import CaseOpen from '../pages/CaseOpen.vue'
import { isValidCaseType } from '../utils/caseHelpers.js'

// Route definitions
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Drink Case Opener - Choose Your Case'
    }
  },
  {
    path: '/case/:caseType',
    name: 'CaseOpen',
    component: CaseOpen,
    props: true,
    meta: {
      title: 'Opening Case...'
    },
    // Route guard to validate case type
    beforeEnter: (to, from, next) => {
      if (isValidCaseType(to.params.caseType)) {
        next()
      } else {
        // Redirect to home if invalid case type
        next('/')
      }
    }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard for page titles
router.beforeEach((to, from, next) => {
  // Update page title based on route meta
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
