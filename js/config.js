// Configurações do Jogo
const CONFIG = {
    // Arena
    ARENA_SIZE: 3000, // Reduzido de 5000 para 3000 (tela mais próxima)
    ARENA_SHAPE: 'circle', // 'circle' ou 'square'
    ARENA_BORDER_WIDTH: 20,

    // Snake
    SNAKE_INITIAL_LENGTH: 15,
    SNAKE_SEGMENT_SIZE: 7,
    SNAKE_SEGMENT_SPACING: 4, // Aumentado para 4 (mais "esticada")
    SNAKE_BASE_SPEED: 200,
    SNAKE_BOOST_MULTIPLIER: 2,
    SNAKE_BOOST_COST_PER_SECOND: 0.5,
    SNAKE_MIN_LENGTH_TO_BOOST: 20, // Ajustado para novo comprimento
    SNAKE_TURN_SPEED: 0.1,

    // Food
    FOOD_SIZE: 6,
    FOOD_VALUE: 1,
    FOOD_SPAWN_RATE: 20,
    FOOD_MIN_COUNT: 500,
    FOOD_DESPAWN_TIME: Infinity,

    // Food Especial
    FOOD_GIANT_SIZE: 18,
    FOOD_GIANT_VALUE: 10,
    FOOD_GIANT_SPAWN_INTERVAL: 30000,
    FOOD_GIANT_COLOR: '#FFD700',

    // Partículas (reduzidas para melhor performance/memória)
    MAX_PARTICLES: 60, // Reduzido de 100 para 60 (CRÍTICO para memória em mapas cheios)
    PARTICLE_LIFETIME: 300, // Reduzido de 500 para 300
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

    // Câmera - Zoom aumentado para cobrinha mais próxima (estilo Slither)
    CAMERA_LERP_FACTOR: 0.1,
    ZOOM_MIN: 0.9, // Aumentado (mais perto)
    ZOOM_MAX: 1.8, // Aumentado (visão macro)
    ZOOM_FACTOR: 0.0003,

    // Renderização - TEMA DE NATAL 🎅❄️
    GRID_SIZE: 50,
    GRID_COLOR: 'rgba(255, 255, 255, 0.1)',
    BACKGROUND_COLOR: '#0b1015',

    // Tema de Natal
    CHRISTMAS_THEME: {
        ENABLED: false,
        SNOW_ENABLED: false,
        SANTA_ENABLED: false,
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
        BORDER: '#354350', // Borda cinza azulada escura (discreta)
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
        // Básico - Cores sólidas e gradientes simples (Tudo desbloqueado)
        { id: 'orange', name: 'Cilho', category: 'BASICO', colors: ['#ff6b35', '#ff9f1c'], pattern: 'solid', unlocked: true, face: { type: 'cute', eyeColor: '#ffffff' } },
        { id: 'dragon', name: 'Dragão', category: 'BASICO', colors: ['#9370db', '#ba55d3'], pattern: 'scales', unlocked: true, face: { type: 'dragon', eyeColor: '#000000' } },
        { id: 'fox', name: 'Raposa', category: 'BASICO', colors: ['#ff6347', '#ff7f50'], pattern: 'gradient', unlocked: true, face: { type: 'fox', eyeColor: '#ffffff' } },
        { id: 'gray', name: 'Cisne', category: 'BASICO', colors: ['#e0e0e0', '#bdbdbd'], pattern: 'solid', unlocked: true, face: { type: 'standard', eyeColor: '#000000' } },
        { id: 'cyan', name: 'Clone', category: 'BASICO', colors: ['#00ffcc', '#00b4d8'], pattern: 'solid', unlocked: true, face: { type: 'happy', eyeColor: '#ffffff' } },
        { id: 'green', name: 'Verde', category: 'BASICO', colors: ['#06ffa5', '#52b788'], pattern: 'solid', unlocked: true, face: { type: 'standard', eyeColor: '#ffffff' } },
        { id: 'tiger', name: 'Tigre', category: 'BASICO', colors: ['#ff8c00', '#000000'], pattern: 'stripes', unlocked: true, face: { type: 'cat', eyeColor: '#ffff00' } },
        { id: 'lime', name: 'Ambiente', category: 'BASICO', colors: ['#c0ff00', '#a0d911'], pattern: 'solid', unlocked: true, face: { type: 'cute', eyeColor: '#000000' } },
        { id: 'pizza', name: 'Pizza', category: 'BASICO', colors: ['#ffd700', '#ffa500'], pattern: 'solid', unlocked: true, face: { type: 'pizza', eyeColor: '#000000' } },

        // Animais - Padrões inspirados em animais (Tudo desbloqueado)
        { id: 'cobra', name: 'Cobra', category: 'ANIMAIS', colors: ['#1b4d1b', '#2d5016'], pattern: 'scales', unlocked: true, face: { type: 'angry', eyeColor: '#ff0000' } },
        { id: 'claro', name: 'Claro', category: 'ANIMAIS', colors: ['#4caf50', '#66bb6a'], pattern: 'solid', unlocked: true, face: { type: 'standard', eyeColor: '#ffffff' } },
        { id: 'yellow', name: 'Gato', category: 'ANIMAIS', colors: ['#c0ff00', '#a0d911'], pattern: 'solid', unlocked: true, face: { type: 'cat', eyeColor: '#000000' } },
        { id: 'yellowdark', name: 'Verde Escuro', category: 'ANIMAIS', colors: ['#ffea00', '#ffd60a'], pattern: 'solid', unlocked: true, face: { type: 'cute', eyeColor: '#000000' } },
        { id: 'bear', name: 'Urso', category: 'ANIMAIS', colors: ['#616161', '#424242'], pattern: 'solid', unlocked: true, face: { type: 'bear', eyeColor: '#ffffff' } },
        { id: 'lion', name: 'Leão', category: 'ANIMAIS', colors: ['#daa520', '#b8860b'], pattern: 'gradient', unlocked: true, face: { type: 'lion', eyeColor: '#000000' } },
        { id: 'cat', name: 'Gato', category: 'ANIMAIS', colors: ['#f5f5f5', '#e0e0e0'], pattern: 'spots', unlocked: true, face: { type: 'cat', eyeColor: '#ff69b4' } },
        { id: 'rainbow', name: 'Verde Escuro', category: 'ANIMAIS', colors: ['#ff3366', '#ffea00', '#06ffa5', '#00b4d8', '#9d4edd'], pattern: 'rainbow', unlocked: true, face: { type: 'happy', eyeColor: '#ffffff' } },
        { id: 'lightgray', name: 'Ciano', category: 'ANIMAIS', colors: ['#bdbdbd', '#9e9e9e'], pattern: 'solid', unlocked: true, face: { type: 'standard', eyeColor: '#000000' } },

        // Especiais - Padrões únicos e complexos (Tudo desbloqueado)
        { id: 'fire', name: 'Fogo', category: 'ESPECIAIS', colors: ['#ff0000', '#ff6b00', '#ffea00'], pattern: 'fire', unlocked: true, face: { type: 'angry', eyeColor: '#ffff00' } },
        { id: 'ice', name: 'Gelo', category: 'ESPECIAIS', colors: ['#00ffff', '#4dd0e1', '#b3e5fc'], pattern: 'ice', unlocked: true, face: { type: 'cool', eyeColor: '#000000' } },
        { id: 'toxic', name: 'Tóxico', category: 'ESPECIAIS', colors: ['#39ff14', '#00ff00', '#76ff03'], pattern: 'toxic', unlocked: true, face: { type: 'cyclops', eyeColor: '#ff0000' } },
        { id: 'camo', name: 'Gelo', category: 'ESPECIAIS', colors: ['#556b2f', '#6b8e23', '#808000'], pattern: 'camo', unlocked: true, face: { type: 'angry', eyeColor: '#ffff00' } },
        { id: 'darkgray', name: 'Cobra', category: 'ESPECIAIS', colors: ['#424242', '#212121'], pattern: 'solid', unlocked: true, face: { type: 'angry', eyeColor: '#ff0000' } },
        { id: 'gold', name: 'Colina', category: 'ESPECIAIS', colors: ['#ffd700', '#ffed4e', '#fff9c4'], pattern: 'metallic', unlocked: true, face: { type: 'cool', eyeColor: '#000000' } },
        { id: 'darkgreen', name: 'Colina', category: 'ESPECIAIS', colors: ['#1b5e20', '#2e7d32'], pattern: 'scales', unlocked: true, face: { type: 'angry', eyeColor: '#00ff00' } },
        { id: 'galaxy', name: 'Galáxia', category: 'ESPECIAIS', colors: ['#1a0033', '#4a148c', '#7b1fa2', '#ce93d8'], pattern: 'galaxy', unlocked: true, face: { type: 'alien', eyeColor: '#00ffcc' } },
        { id: 'neon', name: 'Neon', category: 'ESPECIAIS', colors: ['#ff00ff', '#00ff00', '#00ffff', '#ff00ff'], pattern: 'neon', unlocked: true, face: { type: 'happy', eyeColor: '#ffffff' } },

        // Premium - Skins raras e especiais (Mantidas como desbloqueáveis)
        { id: 'diamond', name: 'Diamante', category: 'PREMIUM', colors: ['#b9f2ff', '#e0f7fa', '#ffffff'], pattern: 'diamond', unlocked: false, requirement: 'Alcance 5000 pontos', face: { type: 'cool', eyeColor: '#00ffff' } },
        { id: 'lava', name: 'Lava', category: 'PREMIUM', colors: ['#ff0000', '#ff4500', '#000000'], pattern: 'lava', unlocked: false, requirement: 'Alcance 6000 pontos', face: { type: 'angry', eyeColor: '#ff0000' } },
        { id: 'electric', name: 'Elétrico', category: 'PREMIUM', colors: ['#ffff00', '#00ffff', '#ffffff'], pattern: 'electric', unlocked: false, requirement: 'Alcance 7500 pontos', face: { type: 'cyclops', eyeColor: '#ffff00' } },
        { id: 'shadow', name: 'Sombra', category: 'PREMIUM', colors: ['#000000', '#1a1a1a', '#333333'], pattern: 'shadow', unlocked: false, requirement: 'Alcance 10000 pontos', face: { type: 'angry', eyeColor: '#ff0000' } },
        { id: 'cosmic', name: 'Cósmico', category: 'PREMIUM', colors: ['#000033', '#1a0066', '#330099', '#6600cc'], pattern: 'cosmic', unlocked: false, requirement: 'Alcance 15000 pontos', face: { type: 'alien', eyeColor: '#00ff00' } },
        { id: 'rainbow_premium', name: 'Arco-íris Premium', category: 'PREMIUM', colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'], pattern: 'rainbow_premium', unlocked: false, requirement: 'Alcance 20000 pontos', face: { type: 'happy', eyeColor: '#ffffff' } },
    ],

    // Performance
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 100, // ms
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
