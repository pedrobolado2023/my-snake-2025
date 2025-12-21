const CACHE_NAME = 'my-snake-2025-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './mobile-tweaks.css',
    './skin-selection.css',
    './skin-selection-responsive.css',
    './manifest.json',
    './js/config.js',
    './js/utils.js',
    './js/entities/Food.js',
    './js/entities/Snake.js',
    './js/entities/Particle.js',
    './js/entities/SantaClaus.js',
    './js/systems/Camera.js',
    './js/systems/InputManager.js',
    './js/systems/Renderer.js',
    './js/systems/CollisionSystem.js',
    './js/systems/SnowSystem.js',
    './js/SkinSelectionManager.js',
    './js/Game.js',
    './js/main.js',
    './js/firebase-config.js',
    './js/AuthSystem.js',
    './js/MultiplayerManager.js',
    './assets/icon-192.png',
    './assets/icon-512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Ativação e Limpeza de Caches Antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Interceptar Requisições (Estratégia Cache First, Network Fallback)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retorna do cache se encontrar
                if (response) {
                    return response;
                }
                // Se não, busca na rede
                return fetch(event.request).catch(() => {
                    // Pode retornar uma página offline aqui se desejar
                });
            })
    );
});
