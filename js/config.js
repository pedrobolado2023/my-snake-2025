// Configurações do Jogo
const CONFIG = {
    // Arena
    ARENA_SIZE: 3000, // Reduzido de 5000 para 3000 (tela mais próxima)
    ARENA_SHAPE: 'circle', // 'circle' ou 'square'
    ARENA_BORDER_WIDTH: 20,

    // Snake
    SNAKE_INITIAL_LENGTH: 10,
    SNAKE_SEGMENT_SIZE: 7, // Reduzido de 10 para 7 (mais fino)
    SNAKE_SEGMENT_SPACING: 6, // Reduzido de 8 para 6
    SNAKE_BASE_SPEED: 200, // Aumentado de 180 para 200 (mais rápido)
    SNAKE_BOOST_MULTIPLIER: 2,
    SNAKE_BOOST_COST_PER_SECOND: 0.5,
    SNAKE_MIN_LENGTH_TO_BOOST: 15,
    SNAKE_TURN_SPEED: 0.1, // Aumentado de 0.08 para 0.1 (mais ágil)

    // Food
    FOOD_SIZE: 6, // Reduzido de 8 para 6
    FOOD_VALUE: 1,
    FOOD_SPAWN_RATE: 5, // Aumentado de 2 para 5 por segundo
    FOOD_MIN_COUNT: 200, // Aumentado de 80 para 200
    FOOD_DESPAWN_TIME: Infinity, // Comida nunca expira

    // Food Especial
    FOOD_GIANT_SIZE: 18, // Reduzido de 24 para 18
    FOOD_GIANT_VALUE: 10,
    FOOD_GIANT_SPAWN_INTERVAL: 30000, // Reduzido de 60s para 30s (mais comum)
    FOOD_GIANT_COLOR: '#FFD700',

    // Partículas (reduzidas para melhor performance/memória)
    MAX_PARTICLES: 100, // Limite máximo de partículas na tela (CRÍTICO para memória)
    PARTICLE_LIFETIME: 500, // Reduzido de 800ms para 500ms
    PARTICLE_COUNT_ON_DEATH: 5, // Reduzido de 10 para 5
    PARTICLE_COUNT_ON_EAT: 1, // Reduzido de 2 para 1

    // Mobile - Otimizações automáticas
    MOBILE_OPTIMIZATIONS: {
        REDUCE_BOTS: true, // Reduzir bots no mobile
        REDUCE_PARTICLES: true, // Menos partículas
        REDUCE_FOOD: true, // Menos comida
        REDUCE_FOOD: true, // Menos comida
        BOTS_COUNT: 0, // Remover bots (0)
        FOOD_MIN_COUNT: 80, // Aumentado de 40 para 80 no mobile
        MAX_PARTICLES: 50, // Limite ainda menor no mobile
        PARTICLE_COUNT_ON_DEATH: 3, // Metade das partículas
        PARTICLE_COUNT_ON_EAT: 0, // Nenhuma partícula ao comer no mobile
    },

    // Bots
    BOT_COUNT_DESKTOP: 0, // Remover bots (0)

    // Câmera - Zoom aumentado para cobrinha mais próxima
    CAMERA_LERP_FACTOR: 0.1,
    ZOOM_MIN: 0.6, // Limite de zoom out (quanto maior, mais próximo mesmo quando grande)
    ZOOM_MAX: 1.3, // Zoom inicial (maior = mais próximo)
    ZOOM_FACTOR: 0.0002, // Reduzido de 0.0003 (zoom mais gradual)

    // Renderização - TEMA DE NATAL 🎅❄️
    GRID_SIZE: 50,
    GRID_COLOR: 'rgba(255, 255, 255, 0.1)', // Grid branco suave (neve)
    BACKGROUND_COLOR: '#1a2332', // Azul escuro noturno (céu de Natal)

    // Tema de Natal
    CHRISTMAS_THEME: {
        ENABLED: true,
        SNOW_ENABLED: true,
        SANTA_ENABLED: true,
    },

    // Cores Neon (mantidas para as cobras)
    COLORS: {
        NEON_PINK: '#ff3366',
        NEON_CYAN: '#00ffcc',
        NEON_PURPLE: '#9d4edd',
        NEON_BLUE: '#00b4d8',
        NEON_GREEN: '#06ffa5',
        NEON_YELLOW: '#ffea00',
        NEON_ORANGE: '#ff6b35',
        BORDER: '#DC143C', // Vermelho Natal para a borda
    },

    // Categorias de Skins
    SKIN_CATEGORIES: {
        BASICO: 'Básico',
        ANIMAIS: 'Animais',
        ESPECIAIS: 'Especiais',
        PREMIUM: 'Premium'
    },

    // Skins disponíveis com categorias e estilos
    SKINS: [
        // Básico - Cores sólidas e gradientes simples
        { id: 'orange', name: 'Brilho', category: 'BASICO', colors: ['#ff6b35', '#ff9f1c'], pattern: 'solid', unlocked: true, face: { type: 'cute', eyeColor: '#ffffff' } },
        { id: 'gray', name: 'Cinza', category: 'BASICO', colors: ['#6c757d', '#495057'], pattern: 'solid', unlocked: true, face: { type: 'standard', eyeColor: '#ffffff' } },
        { id: 'cyan', name: 'Ciano', category: 'BASICO', colors: ['#00ffcc', '#00b4d8'], pattern: 'solid', unlocked: true, face: { type: 'happy', eyeColor: '#ffffff' } },
        { id: 'green', name: 'Verde', category: 'BASICO', colors: ['#06ffa5', '#52b788'], pattern: 'solid', unlocked: true, face: { type: 'standard', eyeColor: '#ffffff' } },
        { id: 'yellow', name: 'Amarelo', category: 'BASICO', colors: ['#ffea00', '#ffd60a'], pattern: 'solid', unlocked: true, face: { type: 'cute', eyeColor: '#000000' } },
        { id: 'darkgreen', name: 'Verde Escuro', category: 'BASICO', colors: ['#2d5016', '#4a7c2f'], pattern: 'solid', unlocked: true, face: { type: 'angry', eyeColor: '#ff0000' } },

        // Animais - Padrões inspirados em animais
        { id: 'cow', name: 'Vaca', category: 'ANIMAIS', colors: ['#ffffff', '#000000'], pattern: 'spots', unlocked: false, requirement: 'Jogue 3 dias consecutivos', face: { type: 'cow', eyeColor: '#000000' } },
        { id: 'rabbit', name: 'Coelho', category: 'ANIMAIS', colors: ['#f5f5f5', '#e0e0e0'], pattern: 'solid', unlocked: false, requirement: 'Alcance 500 pontos', face: { type: 'rabbit', eyeColor: '#ff69b4' } },
        { id: 'cat', name: 'Gato', category: 'ANIMAIS', colors: ['#d4a574', '#c19a6b'], pattern: 'stripes', unlocked: false, requirement: 'Alcance 750 pontos', face: { type: 'cat', eyeColor: '#00ff00' } },
        { id: 'bear', name: 'Urso', category: 'ANIMAIS', colors: ['#8b4513', '#a0522d'], pattern: 'solid', unlocked: false, requirement: 'Alcance 1000 pontos', face: { type: 'bear', eyeColor: '#ffffff' } },
        { id: 'fox', name: 'Raposa', category: 'ANIMAIS', colors: ['#ff6347', '#ff7f50'], pattern: 'gradient', unlocked: false, requirement: 'Alcance 1250 pontos', face: { type: 'fox', eyeColor: '#ffffff' } },
        { id: 'dragon', name: 'Dragão', category: 'ANIMAIS', colors: ['#9370db', '#ba55d3'], pattern: 'scales', unlocked: false, requirement: 'Alcance 1500 pontos', face: { type: 'angry', eyeColor: '#ffff00' } },

        // Especiais - Padrões únicos e complexos
        { id: 'snake', name: 'Cobra', category: 'ESPECIAIS', colors: ['#2d5016', '#4a7c2f', '#6ba547'], pattern: 'scales', unlocked: false, requirement: 'Mate 5 cobras', face: { type: 'angry', eyeColor: '#ff0000' } },
        { id: 'rainbow', name: 'Arco-íris', category: 'ESPECIAIS', colors: ['#ff3366', '#ffea00', '#06ffa5', '#00b4d8', '#9d4edd'], pattern: 'rainbow', unlocked: false, requirement: 'Alcance 2000 pontos', face: { type: 'happy', eyeColor: '#ffffff' } },
        { id: 'lion', name: 'Leão', category: 'ESPECIAIS', colors: ['#daa520', '#b8860b'], pattern: 'gradient', unlocked: false, requirement: 'Alcance 2500 pontos', face: { type: 'lion', eyeColor: '#000000' } },
        { id: 'tiger', name: 'Tigre', category: 'ESPECIAIS', colors: ['#ff8c00', '#000000'], pattern: 'stripes', unlocked: false, requirement: 'Alcance 3000 pontos', face: { type: 'cat', eyeColor: '#ffff00' } },
        { id: 'panda', name: 'Panda', category: 'ESPECIAIS', colors: ['#ffffff', '#000000'], pattern: 'panda', unlocked: false, requirement: 'Alcance 3500 pontos', face: { type: 'panda', eyeColor: '#000000' } },

        // Premium - Skins raras e especiais
        { id: 'fire', name: 'Fogo', category: 'PREMIUM', colors: ['#ff0000', '#ff6b00', '#ffea00'], pattern: 'fire', unlocked: false, requirement: 'Alcance 4000 pontos', face: { type: 'angry', eyeColor: '#ffff00' } },
        { id: 'ice', name: 'Gelo', category: 'PREMIUM', colors: ['#00ffff', '#4dd0e1', '#b3e5fc'], pattern: 'ice', unlocked: false, requirement: 'Alcance 4500 pontos', face: { type: 'cool', eyeColor: '#000000' } },
        { id: 'toxic', name: 'Tóxico', category: 'PREMIUM', colors: ['#39ff14', '#00ff00', '#76ff03'], pattern: 'toxic', unlocked: false, requirement: 'Alcance 5000 pontos', face: { type: 'cyclops', eyeColor: '#ff0000' } },
        { id: 'galaxy', name: 'Galáxia', category: 'PREMIUM', colors: ['#1a0033', '#4a148c', '#7b1fa2', '#ce93d8'], pattern: 'galaxy', unlocked: false, requirement: 'Alcance 6000 pontos', face: { type: 'alien', eyeColor: '#00ffcc' } },
        { id: 'gold', name: 'Ouro', category: 'PREMIUM', colors: ['#ffd700', '#ffed4e', '#fff9c4'], pattern: 'metallic', unlocked: false, requirement: 'Alcance 7500 pontos', face: { type: 'cool', eyeColor: '#000000' } },
        { id: 'neon', name: 'Neon', category: 'PREMIUM', colors: ['#ff00ff', '#00ff00', '#00ffff', '#ff00ff'], pattern: 'neon', unlocked: false, requirement: 'Alcance 10000 pontos', face: { type: 'happy', eyeColor: '#ffffff' } },
    ],

    // Performance
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 100, // ms
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
