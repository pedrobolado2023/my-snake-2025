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

    renderBackground(camera, snowSystem = null, santaClaus = null) {
        // Limpar tela
        this.clear();

        // Renderizar grid
        this.renderGrid(camera);

        // Renderizar bordas da arena
        this.renderArenaBorder(camera);

        // Renderizar Papai Noel (atrás de tudo) 🎅
        if (santaClaus && CONFIG.CHRISTMAS_THEME.SANTA_ENABLED) {
            santaClaus.render(this.ctx, camera);
        }

        // Renderizar neve (na frente do fundo, atrás das cobras) ❄️
        if (snowSystem && CONFIG.CHRISTMAS_THEME.SNOW_ENABLED) {
            snowSystem.render(this.ctx, camera);
        }
    }

    renderGrid(camera) {
        const bounds = camera.getVisibleBounds();
        const hexSize = 50; // Tamanho do hexágono
        const hexHeight = hexSize * 2;
        const hexWidth = Math.sqrt(3) * hexSize;
        const vertDist = hexHeight * 0.75;

        // Calcular índices visíveis
        const startI = Math.floor(bounds.left / hexWidth) - 1;
        const endI = Math.ceil(bounds.right / hexWidth) + 1;
        const startJ = Math.floor(bounds.top / vertDist) - 1;
        const endJ = Math.ceil(bounds.bottom / vertDist) + 1;

        this.ctx.save();
        this.ctx.lineWidth = 2 * camera.zoom;

        for (let j = startJ; j <= endJ; j++) {
            for (let i = startI; i <= endI; i++) {
                let x = i * hexWidth;
                let y = j * vertDist;

                // Deslocar linhas ímpares
                if (j % 2 !== 0) {
                    x += hexWidth / 2;
                }

                const screenPos = camera.worldToScreen(x, y);

                // Renderizar Hexágono
                this.ctx.beginPath();
                for (let k = 0; k < 6; k++) {
                    const angle = 2 * Math.PI / 6 * (k + 0.5);
                    const hx = screenPos.x + hexSize * camera.zoom * Math.cos(angle);
                    const hy = screenPos.y + hexSize * camera.zoom * Math.sin(angle);
                    if (k === 0) this.ctx.moveTo(hx, hy);
                    else this.ctx.lineTo(hx, hy);
                }
                this.ctx.closePath();

                // Estilo Slither.io (Fundo escuro, borda leve)
                this.ctx.strokeStyle = '#232d36'; // Borda hexágono
                this.ctx.fillStyle = '#161c22';   // Fundo hexágono
                this.ctx.fill();
                this.ctx.stroke();
            }
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
