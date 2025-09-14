/**
 * AgentricAI University - Service Worker
 * Provides offline-first functionality for AAC devices
 */

const CACHE_NAME = 'agentricai-university-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline functionality
const CACHE_RESOURCES = [
  // Core application files
  '/',
  '/student/index.html',
  '/admin/index.html',
  '/offline.html',
  
  // JavaScript bundles
  '/student.js',
  '/admin.js',
  '/common.js',
  '/core.js',
  '/agents.js',
  '/vendors.js',
  
  // Configuration files
  '/config/agents.json',
  '/config/ecosystem.js',
  
  // Essential assets
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/sounds/notification.wav',
  '/assets/sounds/success.wav',
  '/assets/sounds/error.wav',
  
  // Fonts for accessibility
  '/assets/fonts/OpenDyslexic-Regular.woff2',
  '/assets/fonts/OpenDyslexic-Bold.woff2',
  
  // Essential images for AAC communication
  '/assets/images/symbols/yes.png',
  '/assets/images/symbols/no.png',
  '/assets/images/symbols/help.png',
  '/assets/images/symbols/more.png',
  '/assets/images/symbols/finished.png',
  
  // Critical styles
  '/student.css',
  '/admin.css',
  '/common.css',
  
  // PWA manifest
  '/manifest.json'
];

// AAC-specific resources that are critical for communication
const CRITICAL_AAC_RESOURCES = [
  '/assets/images/symbols/',
  '/assets/sounds/',
  '/config/agents.json',
  '/student/index.html'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('🎓 AgentricAI University Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching essential resources for offline AAC functionality');
        return cache.addAll(CACHE_RESOURCES);
      })
      .then(() => {
        console.log('✅ Service Worker installation complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 AgentricAI University Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old cache versions
              return cacheName.startsWith('agentricai-university-') && 
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activation complete');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with fallback strategies
self.addEventListener('fetch', (event) => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // Handle different types of requests with appropriate strategies
  if (isAAC_CriticalResource(event.request)) {
    // Critical AAC resources - cache first for reliability
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (isNavigationRequest(event.request)) {
    // Navigation requests - network first with offline fallback
    event.respondWith(navigationStrategy(event.request));
  } else if (isStaticAsset(event.request)) {
    // Static assets - cache first
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (isAPIRequest(event.request)) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirstStrategy(event.request));
  } else {
    // Default strategy - network first
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Cache-first strategy for critical AAC resources
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Serve from cache immediately
      return cachedResponse;
    }
    
    // Fetch from network if not in cache
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return new Response('Offline - Resource not available', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}

// Network-first strategy for dynamic content
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Fall back to cache if network fails
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for failed requests
    return caches.match(OFFLINE_URL);
  }
}

// Navigation strategy for page requests
async function navigationStrategy(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    return networkResponse;
    
  } catch (error) {
    // Fall back to cached page or offline page
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return the appropriate offline page
    if (request.url.includes('/student/')) {
      return cache.match('/student/index.html') || cache.match(OFFLINE_URL);
    } else if (request.url.includes('/admin/')) {
      return cache.match('/admin/index.html') || cache.match(OFFLINE_URL);
    }
    
    return cache.match(OFFLINE_URL);
  }
}

// Helper functions to classify requests
function isAAC_CriticalResource(request) {
  const url = request.url;
  return CRITICAL_AAC_RESOURCES.some(resource => url.includes(resource)) ||
         url.includes('/assets/images/symbols/') ||
         url.includes('/assets/sounds/') ||
         url.includes('agents.json');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && 
          request.headers.get('accept').includes('text/html'));
}

function isStaticAsset(request) {
  const url = request.url;
  return url.includes('/assets/') ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.svg') ||
         url.includes('.woff') ||
         url.includes('.woff2');
}

function isAPIRequest(request) {
  const url = request.url;
  return url.includes('/api/') ||
         url.includes('/health') ||
         request.method === 'POST';
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'student-progress-sync') {
    event.waitUntil(syncStudentProgress());
  } else if (event.tag === 'interaction-data-sync') {
    event.waitUntil(syncInteractionData());
  }
});

// Sync student progress when online
async function syncStudentProgress() {
  try {
    // Get stored progress data
    const cache = await caches.open(CACHE_NAME);
    const progressData = await getStoredProgressData();
    
    if (progressData && progressData.length > 0) {
      // Send to server when online
      const response = await fetch('/api/v1/student/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData)
      });
      
      if (response.ok) {
        console.log('✅ Student progress synced successfully');
        await clearStoredProgressData();
      }
    }
  } catch (error) {
    console.error('❌ Progress sync failed:', error);
  }
}

// Sync interaction data for learning analytics
async function syncInteractionData() {
  try {
    const interactionData = await getStoredInteractionData();
    
    if (interactionData && interactionData.length > 0) {
      const response = await fetch('/api/v1/student/sync-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactionData)
      });
      
      if (response.ok) {
        console.log('✅ Interaction data synced successfully');
        await clearStoredInteractionData();
      }
    }
  } catch (error) {
    console.error('❌ Interaction sync failed:', error);
  }
}

// Placeholder functions for data management (to be implemented)
async function getStoredProgressData() {
  // Implementation would retrieve stored progress from IndexedDB
  return [];
}

async function clearStoredProgressData() {
  // Implementation would clear stored progress after successful sync
}

async function getStoredInteractionData() {
  // Implementation would retrieve stored interactions from IndexedDB
  return [];
}

async function clearStoredInteractionData() {
  // Implementation would clear stored interactions after successful sync
}

// Message handling for communication with the app
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker received message:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CACHE_STUDENT_DATA':
        // Cache important student data for offline access
        cacheStudentData(event.data.data);
        break;
        
      case 'CLEAR_CACHE':
        // Clear all caches (for troubleshooting)
        clearAllCaches();
        break;
        
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
});

// Cache important student data
async function cacheStudentData(data) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const dataUrl = '/data/student-cache.json';
    
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(dataUrl, response);
    console.log('✅ Student data cached for offline access');
    
  } catch (error) {
    console.error('❌ Failed to cache student data:', error);
  }
}

// Clear all caches (for troubleshooting)
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('✅ All caches cleared');
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
  }
}

console.log('🎓 AgentricAI University Service Worker loaded - Ready for offline AAC support');