// Sistema de Renderização
class Renderer {
    constructor(canvas, minimapCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.minimapCanvas = minimapCanvas;
        this.minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

        // Configurar canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Configurar contexto para melhor qualidade
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    clear() {
        this.ctx.fillStyle = CONFIG.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderBackground(camera) {
        // Limpar tela
        this.clear();

        // Renderizar grid
        this.renderGrid(camera);

        // Renderizar bordas da arena
        this.renderArenaBorder(camera);
    }

    renderGrid(camera) {
        const bounds = camera.getVisibleBounds();
        const gridSize = CONFIG.GRID_SIZE;

        // Calcular linhas visíveis
        const startX = Math.floor(bounds.left / gridSize) * gridSize;
        const startY = Math.floor(bounds.top / gridSize) * gridSize;
        const endX = Math.ceil(bounds.right / gridSize) * gridSize;
        const endY = Math.ceil(bounds.bottom / gridSize) * gridSize;

        this.ctx.save();
        this.ctx.strokeStyle = CONFIG.GRID_COLOR;
        this.ctx.lineWidth = 1;

        // Linhas verticais
        for (let x = startX; x <= endX; x += gridSize) {
            const screenStart = camera.worldToScreen(x, startY);
            const screenEnd = camera.worldToScreen(x, endY);

            this.ctx.beginPath();
            this.ctx.moveTo(screenStart.x, screenStart.y);
            this.ctx.lineTo(screenEnd.x, screenEnd.y);
            this.ctx.stroke();
        }

        // Linhas horizontais
        for (let y = startY; y <= endY; y += gridSize) {
            const screenStart = camera.worldToScreen(startX, y);
            const screenEnd = camera.worldToScreen(endX, y);

            this.ctx.beginPath();
            this.ctx.moveTo(screenStart.x, screenStart.y);
            this.ctx.lineTo(screenEnd.x, screenEnd.y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    renderArenaBorder(camera) {
        this.ctx.save();

        if (CONFIG.ARENA_SHAPE === 'circle') {
            this.renderCircleBorder(camera);
        } else {
            this.renderSquareBorder(camera);
        }

        this.ctx.restore();
    }

    renderCircleBorder(camera) {
        const center = CONFIG.ARENA_SIZE / 2;
        const radius = CONFIG.ARENA_SIZE / 2 - CONFIG.ARENA_BORDER_WIDTH / 2;
        const screenCenter = camera.worldToScreen(center, center);
        const screenRadius = radius * camera.zoom;

        // Borda externa (perigo)
        this.ctx.strokeStyle = CONFIG.COLORS.BORDER;
        this.ctx.lineWidth = CONFIG.ARENA_BORDER_WIDTH * camera.zoom;
        this.ctx.shadowBlur = 20 * camera.zoom;
        this.ctx.shadowColor = CONFIG.COLORS.BORDER;

        this.ctx.beginPath();
        this.ctx.arc(screenCenter.x, screenCenter.y, screenRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Borda interna (brilho)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2 * camera.zoom;
        this.ctx.shadowBlur = 0;

        this.ctx.beginPath();
        this.ctx.arc(
            screenCenter.x,
            screenCenter.y,
            screenRadius - CONFIG.ARENA_BORDER_WIDTH * camera.zoom / 2,
            0,
            Math.PI * 2
        );
        this.ctx.stroke();
    }

    renderSquareBorder(camera) {
        const margin = CONFIG.ARENA_BORDER_WIDTH / 2;
        const topLeft = camera.worldToScreen(margin, margin);
        const bottomRight = camera.worldToScreen(
            CONFIG.ARENA_SIZE - margin,
            CONFIG.ARENA_SIZE - margin
        );

        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;

        // Borda externa
        this.ctx.strokeStyle = CONFIG.COLORS.BORDER;
        this.ctx.lineWidth = CONFIG.ARENA_BORDER_WIDTH * camera.zoom;
        this.ctx.shadowBlur = 20 * camera.zoom;
        this.ctx.shadowColor = CONFIG.COLORS.BORDER;

        this.ctx.strokeRect(topLeft.x, topLeft.y, width, height);

        // Borda interna
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2 * camera.zoom;
        this.ctx.shadowBlur = 0;

        const innerMargin = CONFIG.ARENA_BORDER_WIDTH * camera.zoom / 2;
        this.ctx.strokeRect(
            topLeft.x + innerMargin,
            topLeft.y + innerMargin,
            width - innerMargin * 2,
            height - innerMargin * 2
        );
    }

    renderMinimap(player, otherSnakes, camera) {
        if (!this.minimapCtx || !player) return;

        const ctx = this.minimapCtx;
        const size = this.minimapCanvas.width;
        const scale = size / CONFIG.ARENA_SIZE;

        // Limpar
        ctx.fillStyle = 'rgba(10, 14, 39, 0.8)';
        ctx.fillRect(0, 0, size, size);

        // Desenhar borda da arena
        ctx.strokeStyle = CONFIG.COLORS.BORDER;
        ctx.lineWidth = 2;

        if (CONFIG.ARENA_SHAPE === 'circle') {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.strokeRect(1, 1, size - 2, size - 2);
        }

        // Desenhar outras cobras (pontos pequenos)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        otherSnakes.forEach(snake => {
            if (snake.isDead) return;
            const x = snake.x * scale;
            const y = snake.y * scale;
            ctx.fillRect(x - 1, y - 1, 2, 2);
        });

        // Desenhar jogador (ponto brilhante)
        const playerX = player.x * scale;
        const playerY = player.y * scale;

        ctx.fillStyle = CONFIG.COLORS.NEON_CYAN;
        ctx.shadowBlur = 5;
        ctx.shadowColor = CONFIG.COLORS.NEON_CYAN;
        ctx.beginPath();
        ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Desenhar campo de visão
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.3)';
        ctx.lineWidth = 1;
        const viewRadius = (this.canvas.width / camera.zoom / 2) * scale;
        ctx.beginPath();
        ctx.arc(playerX, playerY, viewRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    renderParticles(particles, camera) {
        particles.forEach(particle => {
            particle.render(this.ctx, camera);
        });
    }

    renderFood(foodArray, camera) {
        foodArray.forEach(food => {
            food.render(this.ctx, camera);
        });
    }

    renderSnakes(snakes, camera) {
        // Renderizar cobras (do menor para o maior para melhor sobreposição)
        const sortedSnakes = [...snakes].sort((a, b) => a.length - b.length);

        sortedSnakes.forEach(snake => {
            snake.render(this.ctx, camera);
        });
    }

    renderDebugInfo(fps, entityCount) {
        this.ctx.save();
        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#00ffcc';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${fps}`, 10, 20);
        this.ctx.fillText(`Entities: ${entityCount}`, 10, 40);
        this.ctx.restore();
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}
