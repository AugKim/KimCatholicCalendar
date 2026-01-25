/**
 * Service Worker - Lịch Phụng Vụ Công Giáo
 * Cache các tài nguyên tĩnh để tăng tốc độ tải trang
 */

const CACHE_NAME = 'liturgical-calendar-v1';
const CACHE_VERSION = 1;

// Danh sách các file cần cache (relative paths)
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/controller.js',
    './Reading/readingdata.js',
    './Reading/readings_year_1.js',
    './Reading/readings_year_2.js',
    './Reading/Sunday.js',
    './Reading/DailySeason.js',
    './Reading/Saints.js',
    './Reading/SaintsBible.js',
    './Reading/Optionsaint.js',
    './Reading/eucharisticAdoration.js'
];

// CDN resources (cache với chiến lược network-first)
const CDN_ASSETS = [
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((err) => {
                console.error('[SW] Failed to cache static assets:', err);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // CDN resources - Network first, cache fallback
    if (CDN_ASSETS.some(cdn => event.request.url.includes(cdn))) {
        event.respondWith(networkFirstStrategy(event.request));
        return;
    }
    
    // Local static assets - Cache first, network fallback
    event.respondWith(cacheFirstStrategy(event.request));
});

// Cache First Strategy - Ưu tiên cache, fallback network
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        // Cập nhật cache trong background
        updateCacheInBackground(request);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Network request failed:', error);
        // Return offline page if available
        return new Response('Offline - Không có kết nối mạng', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network First Strategy - Ưu tiên network, fallback cache
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Cập nhật cache trong background (stale-while-revalidate)
async function updateCacheInBackground(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse);
        }
    } catch (error) {
        // Ignore errors in background update
    }
}

// Message handler - cho phép clear cache từ main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] Cache cleared');
            event.ports[0].postMessage({ success: true });
        });
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then((size) => {
            event.ports[0].postMessage({ size });
        });
    }
});

// Tính kích thước cache
async function getCacheSize() {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    let totalSize = 0;
    
    for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
            const blob = await response.clone().blob();
            totalSize += blob.size;
        }
    }
    
    return totalSize;
}
