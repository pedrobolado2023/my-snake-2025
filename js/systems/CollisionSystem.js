// Sistema de Colisão
class CollisionSystem {
    constructor() {
        this.spatialGrid = new Map();
        this.cellSize = 100;
    }

    clear() {
        this.spatialGrid.clear();
    }

    getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    addToGrid(entity, x, y) {
        const key = this.getCellKey(x, y);
        if (!this.spatialGrid.has(key)) {
            this.spatialGrid.set(key, []);
        }
        this.spatialGrid.get(key).push(entity);
    }

    getNearbyEntities(x, y, radius) {
        const entities = new Set();
        const cellRadius = Math.ceil(radius / this.cellSize);
        const centerCellX = Math.floor(x / this.cellSize);
        const centerCellY = Math.floor(y / this.cellSize);

        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            for (let dy = -cellRadius; dy <= cellRadius; dy++) {
                const key = `${centerCellX + dx},${centerCellY + dy}`;
                const cellEntities = this.spatialGrid.get(key);
                if (cellEntities) {
                    cellEntities.forEach(entity => entities.add(entity));
                }
            }
        }

        return Array.from(entities);
    }

    checkSnakeCollisions(snake, otherSnakes) {
        const head = snake.getHeadPosition();
        const headRadius = snake.getHeadRadius();

        // Verificar colisão com bordas
        if (!Utils.isInArena(head.x, head.y)) {
            return { type: 'border', snake: null };
        }

        // Verificar colisão com outras cobras
        for (const other of otherSnakes) {
            if (other.id === snake.id || other.isDead) continue;

            if (other.collidesWithPoint(head.x, head.y, headRadius)) {
                return { type: 'snake', snake: other };
            }
        }

        return null;
    }

    checkFoodCollisions(snake, foodArray) {
        const head = snake.getHeadPosition();
        const headRadius = snake.getHeadRadius();
        const collectedFood = [];

        for (let i = foodArray.length - 1; i >= 0; i--) {
            const food = foodArray[i];

            if (food.collidesWith(head.x, head.y, headRadius)) {
                collectedFood.push(food);
                foodArray.splice(i, 1);
            }
        }

        return collectedFood;
    }

    buildSpatialGrid(snakes) {
        this.clear();

        // Adicionar segmentos de todas as cobras ao grid
        snakes.forEach(snake => {
            if (snake.isDead) return;

            snake.getSegments().forEach(segment => {
                this.addToGrid(snake, segment.x, segment.y);
            });
        });
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollisionSystem;
}
