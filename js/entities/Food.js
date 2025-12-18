// Classe Food - Representa comida no jogo
class Food {
    constructor(x, y, type = 'normal') {
        this.id = Utils.generateId();
        this.x = x;
        this.y = y;
        this.type = type; // 'normal', 'giant', 'dead_snake'
        this.createdAt = Date.now();

        // Propriedades baseadas no tipo
        this.setupType();

        // Animação
        this.pulsePhase = Utils.random(0, Math.PI * 2);
        this.pulseSpeed = Utils.random(2, 4);
    }

    setupType() {
        switch (this.type) {
            case 'giant':
                this.size = CONFIG.FOOD_GIANT_SIZE;
                this.value = CONFIG.FOOD_GIANT_VALUE;
                this.color = CONFIG.FOOD_GIANT_COLOR;
                this.lifetime = CONFIG.FOOD_DESPAWN_TIME * 2;
                break;

            case 'dead_snake':
                this.size = CONFIG.FOOD_SIZE * 1.2;
                this.value = CONFIG.FOOD_VALUE * 2;
                this.color = this.snakeColor || Utils.randomColor();
                this.lifetime = CONFIG.FOOD_DESPAWN_TIME * 1.5;
                break;

            default: // normal
                this.size = CONFIG.FOOD_SIZE;
                this.value = CONFIG.FOOD_VALUE;
                this.color = this.generateRandomColor();
                this.lifetime = CONFIG.FOOD_DESPAWN_TIME;
        }
    }

    generateRandomColor() {
        const colors = [
            CONFIG.COLORS.NEON_PINK,
            CONFIG.COLORS.NEON_CYAN,
            CONFIG.COLORS.NEON_PURPLE,
            CONFIG.COLORS.NEON_BLUE,
            CONFIG.COLORS.NEON_GREEN,
            CONFIG.COLORS.NEON_YELLOW,
            CONFIG.COLORS.NEON_ORANGE,
        ];
        return Utils.randomChoice(colors);
    }

    update(deltaTime) {
        // Atualizar animação de pulsação
        this.pulsePhase += this.pulseSpeed * deltaTime / 1000;
    }

    render(ctx, camera) {
        // Converter para coordenadas de tela
        const screenPos = camera.worldToScreen(this.x, this.y);

        // Verificar se está visível
        if (!camera.isVisible(this.x, this.y, this.size)) {
            return;
        }

        // Calcular tamanho com pulsação
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
        const renderSize = this.size * pulse * camera.zoom;

        ctx.save();

        // Desenhar brilho
        if (this.type === 'giant') {
            ctx.shadowBlur = 30 * camera.zoom;
            ctx.shadowColor = this.color;
        } else {
            ctx.shadowBlur = 15 * camera.zoom;
            ctx.shadowColor = this.color;
        }

        // Desenhar comida
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, renderSize, 0, Math.PI * 2);
        ctx.fill();

        // Desenhar borda brilhante
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2 * camera.zoom;
        ctx.stroke();

        // Desenhar estrela para comida gigante
        if (this.type === 'giant') {
            this.drawStar(ctx, screenPos.x, screenPos.y, renderSize * 0.6, 5);
        }

        ctx.restore();
    }

    drawStar(ctx, x, y, radius, points) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();

        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const r = i % 2 === 0 ? radius : radius * 0.5;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    isExpired() {
        return Date.now() - this.createdAt > this.lifetime;
    }

    collidesWith(x, y, radius) {
        return Utils.circleCollision(this.x, this.y, this.size, x, y, radius);
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Food;
}
