// ConfiguraÃ§Ãµes do Jogo
const CONFIG = {
    // Arena
    ARENA_SIZE: 5000,
    ARENA_SHAPE: 'circle', // 'circle' ou 'square'
    ARENA_BORDER_WIDTH: 20,

    // Snake
    SNAKE_INITIAL_LENGTH: 10,
    SNAKE_SEGMENT_SIZE: 7, // Reduzido de 10 para 7 (mais fino)
    SNAKE_SEGMENT_SPACING: 6, // Reduzido de 8 para 6
    SNAKE_BASE_SPEED: 200, // Aumentado de 180 para 200 (mais rÃ¡pido)
    SNAKE_BOOST_MULTIPLIER: 2,
    SNAKE_BOOST_COST_PER_SECOND: 0.5,
    SNAKE_MIN_LENGTH_TO_BOOST: 15,
    SNAKE_TURN_SPEED: 0.1, // Aumentado de 0.08 para 0.1 (mais Ã¡gil)

    // Food
    FOOD_SIZE: 6, // Reduzido de 8 para 6
    FOOD_VALUE: 1,
    FOOD_SPAWN_RATE: 2, // Reduzido de 5 para 2 por segundo
    FOOD_MIN_COUNT: 80, // Reduzido de 200 para 80
    FOOD_DESPAWN_TIME: Infinity, // Comida nunca expira

    // Food Especial
    FOOD_GIANT_SIZE: 18, // Reduzido de 24 para 18
    FOOD_GIANT_VALUE: 10,
    FOOD_GIANT_SPAWN_INTERVAL: 60000, // Aumentado de 30s para 60s (mais rara)
    FOOD_GIANT_COLOR: '#FFD700',

    // PartÃ­culas (OTIMIZADAS âš¡ para melhor performance)
    PARTICLE_LIFETIME: 600, // Reduzido de 800ms para 600ms
    PARTICLE_COUNT_ON_DEATH: 8, // Reduzido de 10 para 8
    PARTICLE_COUNT_ON_EAT: 1, // Reduzido de 2 para 1
    MAX_PARTICLES: 150, // Limite mÃ¡ximo de partÃ­culas ativas

    // Mobile - OtimizaÃ§Ãµes automÃ¡ticas ULTRA âš¡
    MOBILE_OPTIMIZATIONS: {
        REDUCE_BOTS: true,
        REDUCE_PARTICLES: true,
        REDUCE_FOOD: true,
        BOTS_COUNT: 1, // ⚡ Apenas 1 bot no mobile // Reduzido de 3 para 2 bots no mobile
        FOOD_MIN_COUNT: 25, // ⚡ Reduzido para 25 // Reduzido de 50 para 40
        PARTICLE_COUNT_ON_DEATH: 3, // Reduzido de 5 para 3
        PARTICLE_COUNT_ON_EAT: 0, // Sem partÃ­culas ao comer no mobile
        MAX_PARTICLES: 50, // Limite muito menor no mobile
    },

    // CÃ¢mera
    CAMERA_LERP_FACTOR: 0.1,
    ZOOM_MIN: 0.5,
    ZOOM_MAX: 1.2,
    ZOOM_FACTOR: 0.0003,

    // RenderizaÃ§Ã£o - TEMA DE NATAL ðŸŽ…â„ï¸
    GRID_SIZE: 50,
    GRID_COLOR: 'rgba(255, 255, 255, 0.1)', // Grid branco suave (neve)
    BACKGROUND_COLOR: '#1a2332', // Azul escuro noturno (cÃ©u de Natal)

    // Tema de Natal
    CHRISTMAS_THEME: {
        ENABLED: true,
        SNOW_ENABLED: false, // ❌ Desabilitado para melhor performance no mobile
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

    // Skins disponÃ­veis
    SKINS: [
        { id: 'cyan', name: 'Cyan', colors: ['#00ffcc', '#00b4d8'] },
        { id: 'purple', name: 'Purple', colors: ['#9d4edd', '#c77dff'] },
        { id: 'pink', name: 'Pink', colors: ['#ff3366', '#ff6b9d'] },
        { id: 'green', name: 'Green', colors: ['#06ffa5', '#52b788'] },
        { id: 'yellow', name: 'Yellow', colors: ['#ffea00', '#ffd60a'] },
        { id: 'orange', name: 'Orange', colors: ['#ff6b35', '#ff9f1c'] },
        { id: 'blue', name: 'Blue', colors: ['#00b4d8', '#0077b6'] },
        { id: 'red', name: 'Red', colors: ['#e63946', '#f72585'] },
        { id: 'rainbow', name: 'Rainbow', colors: ['#ff3366', '#ffea00', '#06ffa5', '#00b4d8', '#9d4edd'] },
        { id: 'fire', name: 'Fire', colors: ['#ff0000', '#ff6b00', '#ffea00'] },
        { id: 'ice', name: 'Ice', colors: ['#00ffff', '#4dd0e1', '#b3e5fc'] },
        { id: 'toxic', name: 'Toxic', colors: ['#39ff14', '#00ff00', '#76ff03'] },
        { id: 'galaxy', name: 'Galaxy', colors: ['#1a0033', '#4a148c', '#7b1fa2', '#ce93d8'] },
        { id: 'sunset', name: 'Sunset', colors: ['#ff6b6b', '#ff8c42', '#ffd93d'] },
        { id: 'ocean', name: 'Ocean', colors: ['#006994', '#0099cc', '#00ccff'] },
        { id: 'forest', name: 'Forest', colors: ['#2d5016', '#4a7c2f', '#6ba547'] },
        { id: 'lava', name: 'Lava', colors: ['#8b0000', '#ff4500', '#ff6347'] },
        { id: 'gold', name: 'Gold', colors: ['#ffd700', '#ffed4e', '#fff9c4'] },
        { id: 'silver', name: 'Silver', colors: ['#c0c0c0', '#d3d3d3', '#e8e8e8'] },
        { id: 'neon', name: 'Neon', colors: ['#ff00ff', '#00ff00', '#00ffff', '#ff00ff'] },
    ],

    // Performance
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 100, // ms
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}


